import prisma from "../config/prisma.js";

async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email) {
  //return prisma.user.findUnique({   // 대소문자 구분
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email.toLowerCase(), 
        mode: 'insensitive', 
      },
    },
  });
}

async function save(user) {
  return prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      password: user.password
    },
  });
}

async function update(id, data) {
  return prisma.user.update({
    where: {
      id,
    },
    data: data,
  })
}

async function createOrUpdate(provider, providerId, email, nickname) {
  return prisma.user.upsert({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
    update: {
      email,
      nickname,
    },
    create: {
      provider,
      providerId,
      email,
      nickname,
    },
  });
}

export default {
  findById,
  findByEmail,
  save,
  update,
  createOrUpdate,
}
