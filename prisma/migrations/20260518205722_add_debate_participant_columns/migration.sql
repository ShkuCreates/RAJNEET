-- AlterTable
ALTER TABLE "DebateParticipant" ADD COLUMN     "is_muted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_camera_on" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_mic_on" BOOLEAN NOT NULL DEFAULT true;
