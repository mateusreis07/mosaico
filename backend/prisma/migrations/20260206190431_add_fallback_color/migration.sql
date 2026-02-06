-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fallbackColor" TEXT NOT NULL DEFAULT '#000000',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sector" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "number" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SeatEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seatId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeatEvent_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeatEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatEvent_seatId_eventId_key" ON "SeatEvent"("seatId", "eventId");
