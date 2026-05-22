import { EmailService, EmailMessage } from './email';
import { ChatService, ChatMessage } from './chat';
import { VoiceService, VoiceCall } from './voice';
import { Logger } from '@serviceos/shared';

const logger = new Logger('InteractionManager');

export type InteractionChannel = 'email' | 'chat' | 'voice' | 'sms' | 'webhook';

export interface Interaction {
  id: string;
  channel: InteractionChannel;
  customerId: string;
  agentId?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  data: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
}

export class InteractionManager {
  private emailService: EmailService;
  private chatService: ChatService;
  private voiceService: VoiceService;
  private interactions: Map<string, Interaction>;

  constructor() {
    this.emailService = new EmailService();
    this.chatService = new ChatService();
    this.voiceService = new VoiceService();
    this.interactions = new Map();
  }

  async initiateInteraction(
    channel: InteractionChannel,
    customerId: string,
    data: Record<string, unknown>
  ): Promise<Interaction> {
    logger.info(`Initiating ${channel} interaction for customer ${customerId}`);

    const interaction: Interaction = {
      id: `interaction_${Date.now()}`,
      channel,
      customerId,
      status: 'pending',
      data,
      startedAt: new Date(),
    };

    this.interactions.set(interaction.id, interaction);

    switch (channel) {
      case 'email':
        await this.emailService.sendEmail(data as EmailMessage);
        break;
      case 'chat':
        await this.chatService.startConversation(
          customerId,
          data.agentId as string
        );
        break;
      case 'voice':
        await this.voiceService.initiateCall(
          customerId,
          data.phoneNumber as string,
          data.agentId as string
        );
        break;
    }

    interaction.status = 'active';
    return interaction;
  }

  async completeInteraction(interactionId: string): Promise<void> {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) {
      return;
    }

    logger.info(`Completing ${interaction.channel} interaction ${interactionId}`);

    interaction.status = 'completed';
    interaction.completedAt = new Date();
  }

  async failInteraction(interactionId: string, reason?: string): Promise<void> {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) {
      return;
    }

    logger.warn(`Failing ${interaction.channel} interaction ${interactionId}: ${reason}`);

    interaction.status = 'failed';
    interaction.completedAt = new Date();
  }

  async getInteraction(id: string): Promise<Interaction | null> {
    return this.interactions.get(id) || null;
  }

  async getCustomerInteractions(
    customerId: string
  ): Promise<Interaction[]> {
    return Array.from(this.interactions.values()).filter(
      (i) => i.customerId === customerId
    );
  }

  async sendMultiChannelNotification(
    customerId: string,
    message: {
      email?: EmailMessage;
      chat?: string;
      voice?: string;
      channels: InteractionChannel[];
    }
  ): Promise<void> {
    logger.info(
      `Sending multi-channel notification to customer ${customerId}`,
      { channels: message.channels }
    );

    for (const channel of message.channels) {
      try {
        await this.initiateInteraction(channel, customerId, {
          ...message,
          channel,
        });
      } catch (error) {
        logger.error(`Failed to send ${channel} notification`, error);
      }
    }
  }
}
