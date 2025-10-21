/**
 * DevLog Entity - Development Log Domain Entity
 *
 * Represents a deployment/development log entry for tracking platform changes.
 */

export interface DevLogProps {
  readonly id: string
  readonly commitHash: string
  readonly deployTime: Date
  readonly buildTime: string
  readonly version: string
  readonly environment: string
  readonly vercelUrl?: string
  readonly description: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class DevLog {
  private constructor(private readonly props: DevLogProps) {}

  static create(props: Omit<DevLogProps, 'id' | 'createdAt' | 'updatedAt'>): DevLog {
    const now = new Date()
    return new DevLog({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    })
  }

  static fromPersistence(props: DevLogProps): DevLog {
    return new DevLog(props)
  }

  // Getters
  get id(): string {
    return this.props.id
  }

  get commitHash(): string {
    return this.props.commitHash
  }

  get shortCommitHash(): string {
    return this.props.commitHash.substring(0, 8)
  }

  get deployTime(): Date {
    return this.props.deployTime
  }

  get buildTime(): string {
    return this.props.buildTime
  }

  get version(): string {
    return this.props.version
  }

  get environment(): string {
    return this.props.environment
  }

  get vercelUrl(): string | undefined {
    return this.props.vercelUrl
  }

  get description(): string {
    return this.props.description
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get isProduction(): boolean {
    return this.props.environment === 'production'
  }

  get formattedDeployTime(): string {
    return this.props.deployTime.toLocaleString('it-IT')
  }

  // Business methods
  isRecent(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return this.props.deployTime > fiveMinutesAgo
  }

  toPersistence(): DevLogProps {
    return { ...this.props }
  }
}