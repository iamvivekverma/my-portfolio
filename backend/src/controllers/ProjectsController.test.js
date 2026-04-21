const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getData,
  getImageById,
  invalidatePublicProjectsCache,
} = require('./ProjectsController');
const { ProjectModel } = require('../models/ProjectsModel');

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

const originalFind = ProjectModel.find;
const originalFindById = ProjectModel.findById;

test.afterEach(() => {
  ProjectModel.find = originalFind;
  ProjectModel.findById = originalFindById;
  invalidatePublicProjectsCache();
});

test('getData caches public project list responses between requests', async () => {
  let findCalls = 0;

  ProjectModel.find = () => ({
    sort() {
      return {
        lean: async () => {
          findCalls += 1;

          return [
            {
              _id: 'project-1',
              title: 'Locked project',
              description: 'Protected work',
              technologies: ['React'],
              badge: 'NDA-Confidential',
              order: 0,
              createdAt: new Date('2026-04-16T13:25:34.293Z'),
              pin: '1234',
            },
          ];
        },
      };
    },
  });

  const req = { headers: {} };
  const firstRes = createResponse();
  const secondRes = createResponse();

  await getData(req, firstRes);
  await getData(req, secondRes);

  assert.equal(findCalls, 1);
  assert.equal(firstRes.statusCode, 200);
  assert.deepEqual(firstRes.body, secondRes.body);
  assert.equal(firstRes.headers['Cache-Control'], 'public, max-age=300');
});

test('getData strips protected fields from the public project list', async () => {
  ProjectModel.find = () => ({
    sort() {
      return {
        lean: async () => [
          {
            _id: 'project-1',
            title: 'Locked project',
            description: 'Protected work',
            technologies: ['React'],
            badge: 'NDA-Confidential',
            order: 0,
            createdAt: new Date('2026-04-16T13:25:34.293Z'),
            pin: '1234',
            image: 'data:image/png;base64,abc',
            githubLink: 'https://github.com/example/private-project',
          },
        ],
      };
    },
  });

  const res = createResponse();

  await getData({ headers: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    data: [
      {
        _id: 'project-1',
        title: 'Locked project',
        description: 'Protected work',
        technologies: ['React'],
        badge: 'NDA-Confidential',
        order: 0,
        createdAt: new Date('2026-04-16T13:25:34.293Z'),
        isLocked: true,
      },
    ],
  });
});

test('getImageById serves uploaded locked project previews without unlock access', async () => {
  ProjectModel.findById = () => ({
    select() {
      return {
        lean: async () => ({
          image: 'data:image/png;base64,aGVsbG8=',
          pin: '1234',
        }),
      };
    },
  });

  const res = {
    statusCode: 200,
    headers: {},
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    send(payload) {
      this.payload = payload;
      return this;
    },
  };

  await getImageById({ params: { id: '507f1f77bcf86cd799439011' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Content-Type'], 'image/png');
  assert.equal(res.payload.toString('utf8'), 'hello');
});
