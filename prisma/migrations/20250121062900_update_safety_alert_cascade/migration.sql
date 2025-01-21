-- DropForeignKey
ALTER TABLE "SafetyAlert" DROP CONSTRAINT "SafetyAlert_userId_fkey";

-- AddForeignKey
ALTER TABLE "SafetyAlert" ADD CONSTRAINT "SafetyAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
