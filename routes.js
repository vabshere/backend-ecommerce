var Seller = require('./models/seller');
var ProductCategory = require('./models/productCategory');
var Product = require('./models/product');
var qs = require('querystring');
const https = require('https');
const checksum_lib = require('./paytm/checksum');
const key = 'tw!MHmlhYvCg2pND';
const mid = 'niwCWu33735125384185';

module.exports = function(app) {
  app.post('/api/addSeller', (req, res) => {
    let seller = new Seller(req.body);

    seller
      .save()
      .then(() => {
        res.send({ saved: true });
      })
      .catch(err => {
        res.status(400).send({ saved: false });
      });
  });

  app.get('/api/getSellers', (req, res) => {
    Seller.find({}, function(err, result) {
      if (!err) {
        return res.send(result);
      }
    });
  });

  app.post('/api/addProductCategories', (req, res) => {
    let productCategory = new ProductCategory(req.body);
    productCategory
      .save()
      .then(() => {
        res.send({ saved: true });
      })
      .catch(err => {
        res.status(400).send({ saved: false });
      });
  });

  app.get('/api/getProductCategories', (req, res) => {
    ProductCategory.find({}, function(err, result) {
      if (!err) {
        return res.send(result);
      }
    }).catch(err => {
      res.status(400).send({ saved: false });
    });
  });

  app.get('/api/getProducts', (req, res) => {
    // ProductCategory.findById('5def4a5e4c819b372c317ec5').then(res =>
    //   console.log(res)
    // );
    Product.find()
      .then(result => {
        return new Promise(async function(resolve, reject) {
          result.map(async (q, index) => {
            await ProductCategory.find(q.category).then(category => {
              q.categoryName = category.name;
              if (index == result.length - 1) resolve(result);
            });
            return q;
          });
          // let categoryIds = result.map(x => (x = x.category));
          // var stack = [];

          // for (var i = categoryIds.length - 1; i > 0; i--) {
          //   var rec = {
          //     $cond: [{ $eq: ['$_id', categoryIds[i - 1]] }, i]
          //   };
          //   if (stack.length == 0) {
          //     rec['$cond'].push(i + 1);
          //   } else {
          //     var lval = stack.pop();
          //     rec['$cond'].push(lval);
          //   }
          //   stack.push(rec);
          // }

          // var pipeline = [
          //   { $match: { _id: { $in: categoryIds } } },
          //   { $addFields: { weight: stack[0] } },
          //   { $sort: { weight: 1 } }
          // ];

          // await ProductCategory.aggregate(pipeline).then(r => {
          //   for (let i = 0; i < r.length; i++) {
          //     result[i].categoryName = r[i].name;
          //   }
          // });
          // resolve(result);
        });
      })
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        res.status(400).send({ saved: false });
      });
  });

  app.post('/api/addProduct', (req, res) => {
    let product = new Product(req.body);
    product
      .save()
      .then(() => {
        res.send({ saved: true });
      })
      .catch(err => {
        res.status(400).send({ saved: false });
      });
  });

  app.post('/api/updateProduct', async (req, res) => {
    const product = await Product.findById(req.body._id);
    product.quantity = req.body.quantity;
    product
      .save()
      .then(() => {
        res.send({ saved: true });
      })
      .catch(err => {
        res.status(400).send({ saved: false });
      });
  });

  app.get('/payment', (req, res) => {
    var params = {};
    params['MID'] = 'niwCWu33735125384185';
    params['WEBSITE'] = 'WEBSTAGING';
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = 'Customer001';
    params['TXN_AMOUNT'] = '1.00';
    params['CALLBACK_URL'] = 'http://localhost:8080/paytmResponse';
    params['EMAIL'] = 'abc@mailinator.com';
    params['MOBILE_NO'] = '7777777777';

    checksum_lib.genchecksum(params, key, function(err, checksum) {
      var txn_url = 'https://securegw-stage.paytm.in/order/process'; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = '';
      for (var x in params) {
        form_fields += "<input name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields += "<input name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          form_fields +
          '<button type="submit">Submit</button></form></body></html>'
      );
      res.end();
    });
  });

  app.post('/paytmResponse', (req, res) => {
    console.log('called response');

    var body = '';

    req.on('data', function(data) {
      body += data;
    });

    req.on('end', function() {
      var html = '';
      var post_data = qs.parse(body);

      // received params in callback
      console.log('Callback Response: ', post_data, '\n');
      html += '<b>Callback Response</b><br>';
      for (var x in post_data) {
        html += x + ' => ' + post_data[x] + '<br/>';
      }
      html += '<br/><br/>';

      // verify the checksum
      var checksumhash = post_data.CHECKSUMHASH;
      // delete post_data.CHECKSUMHASH;
      var result = checksum_lib.verifychecksum(post_data, key, checksumhash);
      console.log('Checksum Result => ', result, '\n');
      html += '<b>Checksum Result</b> => ' + (result ? 'True' : 'False');
      html += '<br/><br/>';

      // Send Server-to-Server request to verify Order Status
      var params = { MID: mid, ORDERID: post_data.ORDERID };

      checksum_lib.genchecksum(params, key, function(err, checksum) {
        params.CHECKSUMHASH = checksum;
        post_data = 'JsonData=' + JSON.stringify(params);

        var options = {
          hostname: 'securegw-stage.paytm.in', // for staging
          // hostname: 'securegw.paytm.in', // for production
          port: 443,
          path: '/order/status',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          }
        };

        // Set up the request
        var response = '';
        var post_req = https.request(options, function(post_res) {
          post_res.on('data', function(chunk) {
            response += chunk;
          });

          post_res.on('end', function() {
            console.log('S2S Response: ', response, '\n');

            var _result = JSON.parse(response);
            html += '<b>Status Check Response</b><br>';
            for (var x in _result) {
              html += x + ' => ' + _result[x] + '<br/>';
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(html);
            res.end();
          });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
      });
    });
  });
};
