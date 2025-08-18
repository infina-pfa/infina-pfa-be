import { ApiProperty } from '@nestjs/swagger';

export class SpeechToTextResponseDto {
  @ApiProperty({
    description: 'Transcribed text from the audio',
    example: 'Hello, this is the transcribed text.',
  })
  text: string;
}
