import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import { resetDb } from '../../test/db.js';

describe('Saved Addresses API', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await prisma.$disconnect();
  });

  it('requires authentication on /api/v1/addresses', async () => {
    const res = await request(createApp()).get('/api/v1/addresses');
    expect(res.status).toBe(401);
  });

  it('creates a default first address, allows adding a new default, and enforces 10-digit phone', async () => {
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/api/v1/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });

    const badPhone = await agent.post('/api/v1/addresses').send({
      fullName: 'Alice',
      line1: '123 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '+91 12345',
    });
    expect(badPhone.status).toBe(400);

    const first = await agent.post('/api/v1/addresses').send({
      label: 'Home',
      fullName: 'Alice',
      line1: '123 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
      phone: '+91 9876543210',
    });
    expect(first.status).toBe(201);
    expect(first.body.data.isDefault).toBe(true);

    const second = await agent.post('/api/v1/addresses').send({
      label: 'Office',
      fullName: 'Alice',
      line1: '456 Tech Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      country: 'India',
      phone: '+91 9123456789',
      isDefault: true,
    });
    expect(second.status).toBe(201);
    expect(second.body.data.isDefault).toBe(true);

    const list = await agent.get('/api/v1/addresses');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);
    expect(list.body.data[0].id).toBe(second.body.data.id);
    expect(list.body.data[0].isDefault).toBe(true);
    expect(list.body.data[1].isDefault).toBe(false);

    const setFirstDefault = await agent.patch(`/api/v1/addresses/${first.body.data.id}/default`);
    expect(setFirstDefault.status).toBe(200);
    expect(setFirstDefault.body.data.isDefault).toBe(true);
  });
});
