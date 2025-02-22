import test, { onFinish } from 'tape';
import request from 'supertest';
import { app } from '../server'; // Named import

test('GET / should return 200 OK', t => {
  request(app)
    .get('/')
    .expect(200)
    .end(t.end);
});

// ... other tests ...

onFinish(() => process.exit(0));