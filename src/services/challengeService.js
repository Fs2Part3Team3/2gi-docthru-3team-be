import challengeRepository from "../repositories/challengeRepository.js";

async function get({ page, limit, filters }) {
  const skip = (page - 1) * limit;
  const take = limit;
  const { field, type, progress, keyword } = filters;

  const where = {
    AND: [
      field && field.length > 0 ? { field: { in: field } } : {}, 
      type ? { docType: type } : {},
      progress !== undefined ? { progress } : {},
      keyword ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { description: { contains: keyword, mode: "insensitive" } }
        ]
      } : {},
      { applications: { status: "Accepted" } },
    ]
  };

  const challenges = await challengeRepository.get({ where, skip, take });

  const totalCount = await challengeRepository.count({ where });

  return { data: challenges, totalCount };
};

async function getById(id) {
  const challenge = await challengeRepository.getById(id);

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const worksLikeCount = challenge.works.map((work) => ({
    id: work.id,
    nickname: work.user.nickname,
    grade: work.user.grade,
    submittedAt: work.submittedAt,
    likeCount: work._count.likes
  }));

  const application = challenge.applications ? {
    // appliedAt: challenge.applications.appliedAt,
    status: challenge.applications.status,
    user: {
      id: challenge.applications.user.id,
      nickname: challenge.applications.user.nickname,
      grade: challenge.applications.user.grade
    }
  } : null;

  return {
    ...challenge,
    applications: application,
    works: worksLikeCount,
    workTotalCount: challenge._count.works,
    _count: undefined
  };
}

async function create(data) {
  const { title, docUrl, field, type, deadLine, maxParticipants, description, userId } = data;
  
  const [year, month, day] = deadLine.split("/").map(Number);
  const formattedDate = new Date(year, month - 1, day);

  const challengeData = {
    title, docUrl, field, docType: type, deadLine: formattedDate, maxParticipants, description, userId
  };

  return await challengeRepository.create(challengeData);
};

async function update(id, data, user) {
  const challenge = await challengeRepository.findById(id);

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const isOwner = challenge.applications.userId === user.id;
  const isAdmin = user.role === 'Admin';

  if (!isOwner && !isAdmin) {
    throw new Error("You are not authorized to update this challenge");
  }
  return await challengeRepository.update(id, data);
}

async function remove(id) {
  return await challengeRepository.remove(id);
}

export default { get, getById, create, update };