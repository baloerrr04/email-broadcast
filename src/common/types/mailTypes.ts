// src/interfaces/mailInterfaces.ts

export interface EmailData {
    userId: number;
    broadcasterId: number,
    from: string,
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    status?: string;
    createdAt?: Date;  // Optional createdAt
    updatedAt?: Date;  // Add updatedAt here
}

export interface EmailScheduleData {
    emailId: number;
    scheduleDate: Date;
}

export interface EmailWithSchedules extends EmailData {
    id: number;
    cc: string | undefined;
    bcc: string | undefined;
    schedules: {
        emailId: number;
        scheduleDate: Date;
    }[];
}
