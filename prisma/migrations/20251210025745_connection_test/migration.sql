-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(128) NOT NULL,
    "my_point" VARCHAR(128) NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
