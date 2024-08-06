import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { dummy, list, load, resetFilesForTesting, save } from './routes';


describe('routes', function() {

  // After you know what to do, feel free to delete this Dummy test
  it('dummy', function() {
    // Feel free to copy this test structure to start your own tests, but look at these
    // comments first to understand what's going on.

    // httpMocks lets us create mock Request and Response params to pass into our route functions
    const req1 = httpMocks.createRequest(
        // query: is how we add query params. body: {} can be used to test a POST request
        {method: 'GET', url: '/api/dummy', query: {name: 'Zach'}}); 
    const res1 = httpMocks.createResponse();

    // call our function to execute the request and fill in the response
    dummy(req1, res1);

    // check that the request was successful
    assert.strictEqual(res1._getStatusCode(), 200);
    // and the response data is as expected
    assert.deepEqual(res1._getData(), {greeting: 'Hi, Zach'});
  });


  // TODO: add tests for your routes
  it('save', function() {
    // First branch, straight line code, error case
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {value: "value1"}});
    const res1 = httpMocks.createResponse();
    save(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        'required argument "name" was missing');

    const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {name: 18, value: "value1"}});
    const res2 = httpMocks.createResponse();
    save(req2, res2);
  
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
        'required argument "name" was missing');

    // Second branch, straight line code, error case (only one possible input)
    const req3 = httpMocks.createRequest(
        {method: 'POST', url: '/save', body: {name: "name"}});
    const res3 = httpMocks.createResponse();
    save(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(),
        'required argument "value" was missing');
    
    // Third branch, straight line code
    const req5 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "name2", value: "value2"}});
    const res5 = httpMocks.createResponse();
    save(req5, res5);

    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {replaced: false});

    const req6 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "name2", value: "not value2"}});
    const res6 = httpMocks.createResponse();
    save(req6, res6);

    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(), {replaced: true});


    resetFilesForTesting();
  });

  it('load', function() {
    //Saving files to be used in tests
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key", value: "file value"}});
    const saveResp = httpMocks.createResponse();
    save(saveReq, saveResp);

    const saveReq2 = httpMocks.createRequest({method: 'POST', url: '/save',
    body: {name: "key2", value: "file value 2"}});
    const saveResp2 = httpMocks.createResponse();
    save(saveReq2, saveResp2);

    // First branch, straight line code, error case
    const req1 = httpMocks.createRequest({method: 'GET', url: '/load', query: {}});
    const res1 = httpMocks.createResponse();
    load(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'required argument "name" was missing');

    const req2 = httpMocks.createRequest({method: 'GET', url: '/load', query: {name: 26}});
    const res2 = httpMocks.createResponse();
    load(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'required argument "name" was missing');

    // Second branch, straight line code, error case
    const req3 = httpMocks.createRequest({method: 'GET', url: '/load', query: {name: "not a key"}});
    const res3 = httpMocks.createResponse();
    load(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 404);
    assert.deepStrictEqual(res3._getData(), 'file not found');

    const req4 = httpMocks.createRequest({method: 'GET', url: '/load', query: {name: "also not a key"}});
    const res4 = httpMocks.createResponse();
    load(req4, res4);

    assert.strictEqual(res4._getStatusCode(), 404);
    assert.deepStrictEqual(res4._getData(), 'file not found');


    // Third branch, straight line code
    const req5 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "key"}});
    const res5 = httpMocks.createResponse();
    load(req5, res5);
    
    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData(), {value: "file value"});

    const req6 = httpMocks.createRequest(
        {method: 'GET', url: '/load', query: {name: "key2"}});
    const res6 = httpMocks.createResponse();
    load(req6, res6);
    
    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData(), {value: "file value 2"});
    
    resetFilesForTesting();
  });

  it('list', function() {
    //Straight line code
    //test 1
    const saveReq = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key", value: "file value"}});
    const saveResp = httpMocks.createResponse();
    save(saveReq, saveResp);

    const saveReq2 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key2", value: "file value 2"}});
    const saveResp2 = httpMocks.createResponse();
    save(saveReq2, saveResp2);

    
    const req1 = httpMocks.createRequest({method: 'GET', url: '/list'});
    const res1 = httpMocks.createResponse();
    list(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {files: ["key", "key2"]});
    
    resetFilesForTesting();

    //test 2
    const saveReq3 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key3", value: "file value 3"}});
    const saveResp3 = httpMocks.createResponse();
    save(saveReq3, saveResp3);

    const saveReq4 = httpMocks.createRequest({method: 'POST', url: '/save',
        body: {name: "key3", value: "file value 4"}});
    const saveResp4 = httpMocks.createResponse();
    save(saveReq4, saveResp4);

    const req2 = httpMocks.createRequest({method: 'GET', url: '/list'});
    const res2 = httpMocks.createResponse();
    list(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData(), {files: ["key3"]});

    resetFilesForTesting();

    //test 3
    const req3 = httpMocks.createRequest({method: 'GET', url: '/list'});
    const res3 = httpMocks.createResponse();
    list(req3, res3);

    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData(), {files: []});
  });
});
