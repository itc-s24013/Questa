-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "name" VARCHAR(128) NOT NULL DEFAULT '名称未設定',
    "my_point" INTEGER NOT NULL DEFAULT 0,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "badge_image_url" VARCHAR(256) NOT NULL,
    "rarity" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "choice1" VARCHAR(512) NOT NULL,
    "choice2" VARCHAR(512) NOT NULL,
    "choice3" VARCHAR(512) NOT NULL,
    "choice4" VARCHAR(512) NOT NULL,
    "point" INTEGER NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collect" (
    "id" VARCHAR(36) NOT NULL,
    "badge_id" VARCHAR(36) NOT NULL,
    "user_id" UUID NOT NULL,
    "is_choice" BOOLEAN NOT NULL DEFAULT false,
    "is_icon" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Collect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clear" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" UUID NOT NULL,
    "quest_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "Clear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scope" (
    "rarity_list" INTEGER NOT NULL,
    "probability" INTEGER NOT NULL,

    CONSTRAINT "Scope_pkey" PRIMARY KEY ("rarity_list")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Scope_probability_key" ON "Scope"("probability");

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_rarity_fkey" FOREIGN KEY ("rarity") REFERENCES "Scope"("rarity_list") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collect" ADD CONSTRAINT "Collect_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collect" ADD CONSTRAINT "Collect_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
