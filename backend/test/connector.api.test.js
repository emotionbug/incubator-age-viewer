/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const app = require('../app');
const request = require('supertest');
const session = require('supertest-session');
const assert = require('assert').strict;
import connectParam from './connectParam';

const wrongConnectParam = {
    host: '172.30.1.1',
    port: 1234,
    database: 'agensgraph',
    graph: 'agensgraph',
    user: 'agensgraph',
    password: 'agensgraph',
};

describe('Test Connector Api', () => {

    let mappingUrl = '/api/v1/db';

    it('Execute Connect', (done) => {
        request(app)
            .post(`${mappingUrl}/connect`)
            .send(connectParam)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) done(err);
                assert.deepStrictEqual(res.body, connectParam);
                return done();
            });
    });

    it('Execute Wrong Connect', (done) => {
        request(app)
            .post(`${mappingUrl}/connect`)
            .send(wrongConnectParam)
            .expect(500)
            .end((err, res) => {
                if (err) done(err);
                console.log(res.body)
                done();
            });
    });

    describe('Test Disconnect', () => {
        const sessionRequest = session(app);
        before(function (done) {
            sessionRequest
                .post(`${mappingUrl}/connect`)
                .send(connectParam)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    done();
                });
        });
        it('Test disconnected (Expected 200)', (done) => {
            sessionRequest
                .get(`${mappingUrl}/disconnect`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    done();
                });
        });

        it('Excute disconnected (Expected 500)', (done) => {
            request(app)
                .get(`${mappingUrl}/disconnect`)
                .expect('Content-Type', /json/)
                .expect(500)
                .end((err, res) => {
                    done();
                });
        });
    });

    describe('Test Status', () => {
        const sessionRequest = session(app);
        beforeEach(function (done) {
            sessionRequest
                .post(`${mappingUrl}/connect`)
                .send(connectParam)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    assert(res.body, connectParam);
                    done();
                });
        });
        it('Execute status API', (done) => {
            sessionRequest
                .get(`${mappingUrl}/`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    assert.deepStrictEqual(res.body, connectParam);
                    done();
                });
        });
    });

    describe('Meta Api Test !', () => {
        const sessionRequest = session(app);
        before(function (done) {
            sessionRequest
                .post(`${mappingUrl}/connect`)
                .send(connectParam)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    assert(res.body, connectParam);
                    return done();
                });
        });
        it('Get Meta', (done) => {
            sessionRequest
                .get(`${mappingUrl}/meta`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    console.log(res.body);
                    assert(!!res.body);
                    done();
                });
        });
        it('Get MetaChart', (done) => {
            sessionRequest
                .get(`${mappingUrl}/metaChart`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    console.log(res.body);
                    assert(!!res.body);
                    done();
                });
        });
    });

    it('Test Get Metadata NotConnected', (done) => {
        request(app)
            .get(`${mappingUrl}/meta`)
            .expect('Content-Type', /json/)
            .expect(500)
            .end((err, res) => {
                if (err) done(err);
                done();
            });
    });

    describe('잘못된 연결 후, 정상 연결 시 잘못된 연결데이터 전달', () => {
        const sessionRequest = session(app);
        before(function (done) {
            sessionRequest
                .post(`${mappingUrl}/connect`)
                .send(wrongConnectParam)
                .expect('Content-Type', /json/)
                .expect(500)
                .end((err, res) => {
                    if (err) done(err);
                    console.log(res.body)
                    done();
                });
        });
        it('정상 연결 요청', (done) => {
            sessionRequest
                .post(`${mappingUrl}/connect`)
                .send(connectParam)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) done(err);
                    assert(res.body, connectParam);
                    done();
                });
        });
    });
});
