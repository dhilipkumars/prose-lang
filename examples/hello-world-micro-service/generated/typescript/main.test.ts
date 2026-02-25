import { handleRequest } from './main';
import * as http from 'http';
import { EventEmitter } from 'events';

class MockResponse extends EventEmitter {
  statusCode: number = 0;
  headers: any = {};
  body: string = '';

  writeHead(status: number, headers: any) {
    this.statusCode = status;
    this.headers = headers;
    return this;
  }

  end(data: string) {
    this.body = data;
    this.emit('finish');
  }
}

describe('handleRequest', () => {
  it('should return Vanakam World when both names missing', (done) => {
    const req = {
      url: '/hello',
      method: 'GET'
    } as any;
    const res = new MockResponse() as any;

    res.on('finish', () => {
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ message: 'Vanakam World' });
      done();
    });

    handleRequest(req, res);
  });

  it('should return Vanakam World when only first name missing', (done) => {
    const req = {
      url: '/hello?Last+name=Builder',
      method: 'GET'
    } as any;
    const res = new MockResponse() as any;

    res.on('finish', () => {
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ message: 'Vanakam World' });
      done();
    });

    handleRequest(req, res);
  });

  it('should return Vanakam Builder, Bob when both names present', (done) => {
    const req = {
      url: '/hello?First+name=Bob&Last+name=Builder',
      method: 'GET'
    } as any;
    const res = new MockResponse() as any;

    res.on('finish', () => {
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toEqual({ message: 'Vanakam Builder, Bob' });
      done();
    });

    handleRequest(req, res);
  });
});
