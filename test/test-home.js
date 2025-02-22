'use strict';

/*
 * Module dependencies.
 */

import test, { onFinish } from 'tape';
import request from 'supertest';
import { app } from '../server';

test('Home page', t => {
  request(app)
    .get('/')
    .expect(200)
    .end(t.end);
});

onFinish(() => process.exit(0));
