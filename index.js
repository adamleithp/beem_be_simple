const { GraphQLServer } = require('graphql-yoga')


const Prices = [
 {
   amount: 3100.99,
   currencyCode: 'USD'
 },
 {
   amount: 2999.99,
   currencyCode: 'USD'
 }
]

const Packages = [
  {
    id: '1',
    name: 'Macbook Pro',
    description: '2019 model 15"',
    price: Prices[1],
  }
]

const Requests = [
  {
    id: '1',
    package: Packages[0],
    fromLocation: {
      x: '123123',
      y: '123123',
    },
    status: 'COUNTERED',
    counterOffers: [Prices[0]],
    toLocation: {
      x: '123123',
      y: '123123',
    },
  },
  {
    id: '2',
    package: null,
    fromLocation: {
      x: '123123',
      y: '123123',
    },
    status: 'PENDING',
    toLocation: {
      x: '123123',
      y: '123123',
    },
  }
]

const Trips = [
  {
    id: '1',
    fromLocation: {
      x: '123123',
      y: '123123',
    },
    toLocation: {
      x: '123123',
      y: '123123',
    },
    fromDate: 12312312312123,
    toDate: 123123123123,
    attachedRequests: [Requests[0]]
  },
  {
    id: '2',
    fromLocation: {
      x: '123123',
      y: '123123',
    },
    toLocation: {
      x: '123123',
      y: '123123',
    },
    fromDate: 12312312312123,
    toDate: 123123123123
  }
]






const typeDefs = `
  scalar DateTime

  enum Status {
    PENDING
    OFFERED
    COUNTERED
    REJECTED
    ACCEPTED
    PICKED_UP
    ON_ROUTE
    AROUND_CORNER
    ARRIVED
    DELIVERED
    FAILED
    PAYMENT_FAILED
  }

  type Location {
    x: String!
    y: String!
  }

  type Price {
    amount: Float!
    currencyCode: String!
  }

  type Package {
    id: ID!
    name: String!
    description: String!
    price: Price
  }
  type Request {
    id: ID!
    package: Package
    fromLocation: Location!
    toLocation: Location!
    status: Status!
    counterOffers: [Price]
  }
  type Trip {
    id: ID!
    fromLocation: Location
    toLocation: Location
    fromDate: DateTime!
    toDate: DateTime!
    attachedRequests: [Request]
  }

  type Query {
    myTrip(id: String): Trip!
    myRequest(id: String): Request!
  }
`

const resolvers = {
  Query: {
    myTrip: (_, { id }) => {
      return Trips.filter((trip) => trip.id === id)[0]
    },
    myRequest: (_, { id }) => {
      return Requests.filter((request) => request.id === id)[0]
    },
  },
}

const server = new GraphQLServer({ typeDefs, resolvers })

server.start(() => console.log('Server is running on localhost:4000'))
