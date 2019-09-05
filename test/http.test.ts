import { RequestListener } from 'http';
import { resolve } from 'path';
import * as request from 'supertest';
import {
  serviceFromFunctions,
} from '../src/service';
import {
  functionsFromPath,
} from '../src/util';

describe('express service', () => {
  let app: RequestListener;
  let singleModuleApp: RequestListener;
  const exampleHandlers = resolve(process.cwd(), 'examples');
  const exampleHandlerFile = resolve(process.cwd(), 'examples/hello.ts');
  beforeAll(() => {
    app = serviceFromFunctions(
      functionsFromPath(exampleHandlers),
    );
    singleModuleApp = serviceFromFunctions(
      functionsFromPath(exampleHandlerFile),
    );
  });

  test('404s for undef funcs', async () => {
    await request(singleModuleApp)
      .get('/foo')
      .expect(404);
  });

  test('500 for when things go wrong', async () => {
    await request(app)
      .get('/goodbye')
      .expect(500);
  });

  test('simple string response', async () => {
    const { text } = await request(app)
      .get('/hello')
      .expect(200);
    expect(text).toContain('Hello');
  });

  test('other module available', async () => {
    await request(app)
      .get('/other')
      .expect(200);
  });

  test('status response', async () => {
    const { body } = await request(app)
      .get('/fancy')
      .expect(401);
    expect(body.message).toContain('Unauthorized');
  });
});