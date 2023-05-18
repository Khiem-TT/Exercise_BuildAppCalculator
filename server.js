let http = require('http');
let fs = require('fs');
let qs = require('qs');
const url = require("url");

let server = http.createServer((req, res) => {
    let parseUrl = url.parse(req.url, true);
    let path = parseUrl.pathname;
    let trimPath = path.replace(/^\/+|\/+$/g, '');
    if (req.method === "GET") {
        let chosenHandler = (typeof (router[trimPath]) !== "undefined") ? router[trimPath] : handlers.notFound;
        chosenHandler(req, res);
    } else {
        let chosenHandler = router.main;
        chosenHandler(req, res);
    }
});

server.listen(8000, () => {
    console.log('http://localhost:8000');
});

let handlers = {};
handlers.calculator = (req, res) => {
    fs.readFile('./views/calculator.html', 'utf-8', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
};
handlers.result = (req, res) => {
    fs.readFile('./views/result.html', 'utf-8', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        res.end();
    });
};
handlers.main = (req, res) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        let value = qs.parse(data);
        fs.readFile('./views/calculator.html', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            let calculation = value.calculation;
            let result = 0;
            switch (calculation) {
                case '+':
                    result = +value.parameter1 + +value.parameter2;
                    break;
                case '-':
                    result = +value.parameter1 - +value.parameter2;
                    break;
                case '*':
                    result = +value.parameter1 * +value.parameter2;
                    break;
                case '/':
                    result = +value.parameter1 / +value.parameter2;
                    break;
            }
            let stringObject = `<h1>Result: ${result}</h1>`;
            fs.writeFile('./views/result.html', stringObject, err => {
                if (err) {
                    console.log(err);
                }
                res.writeHead(301, {location: '/result'});
                res.end();
            });
        });
    });
};
handlers.notFound = (req, res) => {
    fs.readFile('./views/notfound.html', 'utf-8', (err, data) => {
        res.writeHead(404);
        res.write(data);
        res.end();
    });
};

let router = {
    'calculator': handlers.calculator,
    'result': handlers.result,
    'main': handlers.main,
};