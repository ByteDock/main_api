import { BaseHelper } from "../interfaces/BaseHelper";
import Docker, { Container, ContainerCreateOptions, ContainerInspectInfo, GetEventsOptions, Network, Volume, VolumeInspectInfo } from 'dockerode';

export class DockerHelper implements BaseHelper {
    private docker: Docker;

    constructor() {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    }

    async initialize(): Promise<void> {
        console.log('Docker Helper initialized');
    }

    async createContainer(options: ContainerCreateOptions): Promise<Container> {
        try {
            return this.docker.createContainer(options);
        } catch(error) {
            console.error(`Error creating container: ${error}`);
            throw error;
        }
    }

    async startContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.start();
        } catch(error) {
            console.error(`Error starting container: ${error}`);
            throw error;
        }
    }

    async stopContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.stop();
        } catch(error) {
            console.error(`Error stopping container: ${error}`);
            throw error;
        }
    }

    async restartContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.restart();
        } catch(error) {
            console.error(`Error restarting container: ${error}`);
            throw error;
        }
    }

    async removeContainer(containerId: string): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            await container.remove();
        } catch(error) {
            console.error(`Error removing container: ${error}`);
            throw error;
        }
    }

    async inspectContainer(containerId: string): Promise<ContainerInspectInfo> {
        try {
            const container = this.docker.getContainer(containerId);
            return await container.inspect();
        } catch(error) {
            console.error(`Error getting container: ${error}`);
            throw error;
        }
    }

    async getContainerLogs(containerId: string): Promise<string> {
        try {
            const container = this.docker.getContainer(containerId);
            const logStream = await container.logs({
                follow: false,
                stdout: true,
                stderr: true
            });

            return logStream.toString('utf8');
        } catch(error) {
            console.error(`Error fetching container logs: ${error}`);
            throw error;
        }
    }

    async pullImage(imageName: string): Promise<void> {
        try {
            await new Promise<void>((resolve, reject) => {
                this.docker.pull(imageName, (err: Error | null, stream: NodeJS.ReadableStream) => {
                    if (err) return reject(err);
                    this.docker.modem.followProgress(stream, (err: Error | null) => {
                        if (err) reject(err);
                        else resolve();
                    })
                })
            })
        } catch(error) {
            console.error(`Error pulling image ${imageName}: ${error}`);
            throw error;
        }
    }

    async listImages(): Promise<Docker.ImageInfo[]> {
        try {
            return await this.docker.listImages({});
        } catch(error) {
            console.error(`Error listing images: ${error}`);
            throw error;
        }
    }

    async removeImage(imageName: string): Promise<void> {
        try {
            const image = this.docker.getImage(imageName);
            await image.remove();
        } catch(error) {
            console.error(`Error removing image ${imageName}: ${error}`);
            throw error;
        }
    }

    async createNetwork(options: Docker.NetworkCreateOptions): Promise<Network> {
        try {
            return await this.docker.createNetwork(options);
        } catch(error) {
            console.error(`Error creating network: ${error}`);
            throw error;
        }
    }

    async listNetworks(): Promise<Docker.NetworkInspectInfo[]> {
        try {
            return await this.docker.listNetworks();
        } catch(error) {
            console.error(`Error fetching networks: ${error}`);
            throw error;
        }
    }

    async inspectNetwork(networkId: string): Promise<Docker.NetworkInspectInfo> {
        try {
            const network = this.docker.getNetwork(networkId);
            return await network.inspect();
        } catch(error) {
            console.error(`Error inspecting network: ${error}`);
            throw error;
        }
    }

    async removeNetwork(networkId: string): Promise<void> {
        try {
            const network = this.docker.getNetwork(networkId);
            await network.remove();
        } catch(error) {
            console.error(`Error removing network: ${error}`);
            throw error;
        }
    }

    async createVolume(options: Docker.VolumeCreateOptions): Promise<Volume> {
        try {
            const volumeData = await this.docker.createVolume(options);
            return this.docker.getVolume(volumeData.Name);
        } catch(error) {
            console.error(`Error creating volume: ${error}`);
            throw error;
        }
    }

    async listVolumes(): Promise<VolumeInspectInfo[]> {
        try {
            const volumes = await this.docker.listVolumes();
            return volumes.Volumes;
        } catch(error) {
            console.error(`Error listing volumes: ${error}`);
            throw error;
        }
    }

    async removeVolume(volumeName: string): Promise<void> {
        try {
            const volume = this.docker.getVolume(volumeName);
            await volume.remove();
        } catch(error) {
            console.error(`Error removing volume: ${error}`);
            throw error;
        }
    }

    async execInContainer(containerId: string, cmd: string[]): Promise<void> {
        try {
            const container = this.docker.getContainer(containerId);
            const exec = await container.exec({
                Cmd: cmd,
                AttachStdout: true,
                AttachStderr: true
            });
            await exec.start({});
        } catch(error) {
            console.error(`Error executing command: ${error}`);
            throw error;
        }
    }

    async streamEvents(options: GetEventsOptions): Promise<NodeJS.ReadableStream> {
        try {
            return this.docker.getEvents(options);
        } catch(error) {
            console.error(`Error getting events: ${error}`);
            throw error;
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            await this.docker.ping();
            return true;
        } catch {
            return false;
        }
    }
}