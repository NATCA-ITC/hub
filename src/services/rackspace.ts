export interface RackspaceServer {
  id: string
  name: string
  status: 'ACTIVE' | 'BUILD' | 'DELETED' | 'ERROR' | 'HARD_REBOOT' | 'PASSWORD' | 'PAUSED' | 'REBOOT' | 'REBUILD' | 'RESCUE' | 'RESIZE' | 'REVERT_RESIZE' | 'SHUTOFF' | 'SUSPENDED' | 'UNKNOWN' | 'VERIFY_RESIZE'
  created: string
  updated: string
  hostId: string
  addresses: Record<string, any[]>
  flavor: {
    id: string
    name?: string
  }
  image: {
    id: string
    name?: string
  }
  metadata: Record<string, string>
}

export interface RackspaceLoadBalancer {
  id: string
  name: string
  status: 'ACTIVE' | 'BUILD' | 'PENDING_UPDATE' | 'PENDING_DELETE' | 'SUSPENDED' | 'ERROR'
  algorithm: string
  protocol: string
  port: number
  nodeCount: number
  created: {
    time: string
  }
  updated: {
    time: string
  }
  virtualIps: Array<{
    id: string
    address: string
    type: string
    ipVersion: string
  }>
}

export interface FacilityInfrastructure {
  facilityCode: string
  servers: RackspaceServer[]
  loadBalancers: RackspaceLoadBalancer[]
  lastUpdated: string
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown'
}

class RackspaceService {
  private baseUrl: string
  private region: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_RACKSPACE_API_ENDPOINT || ''
    this.region = import.meta.env.VITE_RACKSPACE_REGION || 'DFW'
  }

  async getServers(): Promise<RackspaceServer[]> {
    try {
      // This would make actual API calls to Rackspace
      // For now, return mock data for development
      return this.getMockServers()
    } catch (error) {
      console.error('Error fetching servers:', error)
      return []
    }
  }

  async getLoadBalancers(): Promise<RackspaceLoadBalancer[]> {
    try {
      // This would make actual API calls to Rackspace
      // For now, return mock data for development
      return this.getMockLoadBalancers()
    } catch (error) {
      console.error('Error fetching load balancers:', error)
      return []
    }
  }

  async getFacilityInfrastructure(facilityCode: string): Promise<FacilityInfrastructure> {
    try {
      const [servers, loadBalancers] = await Promise.all([
        this.getServers(),
        this.getLoadBalancers(),
      ])

      // Filter servers and load balancers by facility code (from metadata or naming convention)
      const facilityServers = servers.filter(server =>
        server.metadata.facility === facilityCode ||
        server.name.toLowerCase().includes(facilityCode.toLowerCase())
      )

      const facilityLoadBalancers = loadBalancers.filter(lb =>
        lb.name.toLowerCase().includes(facilityCode.toLowerCase())
      )

      const healthStatus = this.calculateHealthStatus(facilityServers, facilityLoadBalancers)

      return {
        facilityCode,
        servers: facilityServers,
        loadBalancers: facilityLoadBalancers,
        lastUpdated: new Date().toISOString(),
        healthStatus,
      }
    } catch (error) {
      console.error('Error fetching facility infrastructure:', error)
      return {
        facilityCode,
        servers: [],
        loadBalancers: [],
        lastUpdated: new Date().toISOString(),
        healthStatus: 'unknown',
      }
    }
  }

  private calculateHealthStatus(servers: RackspaceServer[], loadBalancers: RackspaceLoadBalancer[]): 'healthy' | 'warning' | 'critical' | 'unknown' {
    const allResources = [...servers, ...loadBalancers]

    if (allResources.length === 0) return 'unknown'

    const errorCount = allResources.filter(resource => resource.status === 'ERROR').length
    const activeCount = allResources.filter(resource => resource.status === 'ACTIVE').length

    const errorRate = errorCount / allResources.length

    if (errorRate > 0.5) return 'critical'
    if (errorRate > 0.1 || activeCount / allResources.length < 0.8) return 'warning'
    return 'healthy'
  }

  private getMockServers(): RackspaceServer[] {
    return [
      {
        id: 'server-atl-web-01',
        name: 'ATL-WEB-01',
        status: 'ACTIVE',
        created: '2024-01-15T10:30:00Z',
        updated: '2024-01-20T14:22:00Z',
        hostId: 'host-atl-001',
        addresses: {
          public: [{ addr: '198.51.100.10', version: 4 }],
          private: [{ addr: '10.0.0.10', version: 4 }],
        },
        flavor: { id: 'flavor-1', name: '2GB Standard Instance' },
        image: { id: 'image-1', name: 'Ubuntu 20.04 LTS' },
        metadata: { facility: 'ATL', role: 'web' },
      },
      {
        id: 'server-dfw-db-01',
        name: 'DFW-DB-01',
        status: 'ACTIVE',
        created: '2024-01-10T08:15:00Z',
        updated: '2024-01-22T16:45:00Z',
        hostId: 'host-dfw-001',
        addresses: {
          private: [{ addr: '10.1.0.5', version: 4 }],
        },
        flavor: { id: 'flavor-2', name: '4GB Standard Instance' },
        image: { id: 'image-2', name: 'Ubuntu 20.04 LTS' },
        metadata: { facility: 'DFW', role: 'database' },
      },
    ]
  }

  private getMockLoadBalancers(): RackspaceLoadBalancer[] {
    return [
      {
        id: 'lb-atl-001',
        name: 'ATL-Main-LB',
        status: 'ACTIVE',
        algorithm: 'ROUND_ROBIN',
        protocol: 'HTTP',
        port: 80,
        nodeCount: 3,
        created: { time: '2024-01-15T10:00:00Z' },
        updated: { time: '2024-01-20T14:00:00Z' },
        virtualIps: [
          {
            id: 'vip-1',
            address: '198.51.100.100',
            type: 'PUBLIC',
            ipVersion: 'IPV4',
          },
        ],
      },
    ]
  }
}

export const rackspaceService = new RackspaceService()