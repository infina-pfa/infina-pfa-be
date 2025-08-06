export abstract class AiAdvisorService {
  abstract stream(
    userId: string,
    conversationId: string,
    message: string,
  ): Promise<ReadableStream>;
}
