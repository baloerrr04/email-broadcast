// src/interfaces/mailInterfaces.ts

export interface EmailData {
    userId: number;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    status?: string;
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
