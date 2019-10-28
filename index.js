const { GraphQLServer } = require('graphql-yoga')
const uuidv4 = require('uuid/v4')
const fetch = require('node-fetch')

const _Packages = [];
const _Trips = [];
const _Requests = [];

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
      lat: -12.000000,
      lng: 12.000000,
    },
    status: 'COUNTERED',
    counterOffers: [Prices[0]],
    toLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
  },
  {
    id: '2',
    package: null,
    fromLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
    status: 'PENDING',
    toLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
  }
]

const Trips = [
  {
    id: '1',
    fromLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
    toLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
    fromDate: 12312312312123,
    toDate: 123123123123,
    attachedRequests: [Requests[0]]
  },
  {
    id: '2',
    fromLocation: {
      lat: -12.000000,
      lng: 12.000000,
    },
    toLocation: {
      lat: -12.000000,
      lng: 12.000000,
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

  input LocationInputObject {
    lat: Float!
    lng: Float!
    googlePlaceId: String
  }
  type Location {
    lat: Float!
    lng: Float!
    googlePlaceId: String
  }

  input PriceInputObject {
    amount: Float!
    currencyCode: String!
  }
  type Price {
    amount: Float!
    currencyCode: String!
  }

  input PackageInputObject {
    name: String!
    description: String!
    price: PriceInputObject!
  }
  type Package {
    id: ID!
    name: String!
    description: String!
    price: Price
  }

  input RequestInputObject {
    fromLocation: LocationInputObject!
    toLocation: LocationInputObject!
    offeredPrice: PriceInputObject!
    package: PackageInputObject
  }
  type Request {
    id: ID!
    package: Package
    fromLocation: Location!
    toLocation: Location!
    offeredPrice: Price!
    status: Status!
    counterOffers: [Price]
  }

  input TripInputObject {
    fromLocation: LocationInputObject!
    toLocation: LocationInputObject!
    fromDate: DateTime!
    toDate: DateTime!
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
    myTrips: [Trip]
    myRequest(id: String): Request!
    myRequests: [Request]
    myPackage(id: String): Package!
  }
  type Mutation {
    createTrip(input: TripInputObject): Trip!
    createRequest(input: RequestInputObject): Request!
    createPackage(input: PackageInputObject): Package!
  }
`

const resolvers = {
  Query: {
    myTrip: (_, { id }) => {
      return _Trips.filter((trip) => trip.id === id)[0]
    },
    myTrips: (_) => {
      return _Trips
    },
    myRequest: (_, { id }) => {
      return _Requests.filter((request) => request.id === id)[0]
    },
    myRequests: (_) => {
      return _Requests
    },
    myPackage: (_, { id }) => {
      return Packages.filter((package) => package.id === id)[0]
    },
  },
  Mutation: {
    createTrip: (_, {input}) => {
      const {fromLocation, toLocation, fromDate, toDate} = input;

      const trip = {
        id: uuidv4(),
        fromLocation: {
          lat: fromLocation.lat,
          lng: fromLocation.lng,
          googlePlaceId: fromLocation.googlePlaceId
        },
        toLocation: {
          lat: toLocation.lat,
          lng: toLocation.lng,
          googlePlaceId: toLocation.googlePlaceId
        },
        fromDate: fromDate,
        toDate: toDate,
      }

      // Save trips
      _Trips.push(trip)

      return trip
    },

    createRequest: (_, {input}) => {
      const {fromLocation, toLocation, offeredPrice, package = null} = input;

      const request = {
        id: uuidv4(),
        // this is an establishment
        status: 'PENDING',
        fromLocation: {
          lat: fromLocation.lat,
          lng: fromLocation.lng,
          googlePlaceId: fromLocation.googlePlaceId
        },
        // this is a location
        toLocation: {
          lat: toLocation.lat,
          lng: toLocation.lng,
          googlePlaceId: toLocation.googlePlaceId
        },
        offeredPrice: {
          amount: offeredPrice.amount,
          currencyCode: offeredPrice.currencyCode
        },
      }

      if (package) {
        request.package = {
          id: uuidv4(),
          name: package.name,
          description: package.description,
          price: {
            amount: package.price.amount,
            currencyCode: package.price.currencyCode
          }
        };

        _Packages.push(request.package)
      }

      // Save request
      _Requests.push(request)

      return request
    },

    createPackage: (_, {input}) => {
      const {name, description, price} = input;

      const package = {
        id: uuidv4(),
        name: name,
        description: description,
        price: {
          amount: price.amount,
          currencyCode: price.currencyCode
        }
      }

      return package
    }
  }
}

const opts = {
  port: 4000,
  cors: {
    credentials: true,
    origin: "*" // your frontend url.
  }
};

const server = new GraphQLServer({ typeDefs, resolvers })

server.start(opts, () =>
  console.log(`Server is running on http://localhost:${opts.port}`)
)
