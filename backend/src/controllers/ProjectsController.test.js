const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getData,
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

test.afterEach(() => {
  ProjectModel.find = originalFind;
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
