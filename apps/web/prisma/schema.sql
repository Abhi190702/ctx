PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "repository" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Project_name_key" ON "Project"("name");

CREATE TABLE IF NOT EXISTS "Capsule" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "summary" TEXT,
  "rawText" TEXT,
  "markdown" TEXT,
  "platform" TEXT,
  "sourceUrl" TEXT,
  "sourceType" TEXT,
  "projectId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "schemaVersion" TEXT NOT NULL DEFAULT '0.1.0',
  "goals" TEXT,
  "decisions" TEXT,
  "constraints" TEXT,
  "openQuestions" TEXT,
  "nextSteps" TEXT,
  "tags" TEXT,
  "importance" INTEGER NOT NULL DEFAULT 0,
  "tokenEstimate" INTEGER NOT NULL DEFAULT 0,
  "lastInjectedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Capsule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CapsuleVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "capsuleId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot" TEXT NOT NULL,
  "changeNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CapsuleVersion_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Activity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "capsuleId" TEXT,
  "projectId" TEXT,
  "platform" TEXT,
  "message" TEXT NOT NULL,
  "metadata" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "GitHubCapture" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "repo" TEXT NOT NULL,
  "number" INTEGER,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "rawData" TEXT NOT NULL,
  "capsuleId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
