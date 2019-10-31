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
    id: '3edda445-20d5-4861-8f63-2d8312e771e7',
    status: 'PENDING',
    fromLocation: {
      lat: 45.52269019999999,
      lng: -73.6019644,
      googlePlaceId: 'ChIJQ2XG23gZyUwRoCNTC2xte4M'
    },
    toLocation: {
      lat: 13.1059816,
      lng: -59.61317409999999,
      googlePlaceId: 'ChIJPflM-sL2Q4wRaXCGlWrmwX0'
    },
    offeredPrice: {
      amount: 20, currencyCode: 'USD'
    },
    package: {
      id: 'd27e8fa1-4c9d-4dd6-92d8-b251e9602318',
      name: '12 Montreal Bagel',
      description: 'A dozen bagels from St.Viateur in plateau Montreal',
      price: {
        amount: 20,
        currencyCode: 'USD'
      }
    },
    tripId: "68e9b47f-89e4-47c8-9599-7f4b4c5a6017",
  }
]

const Trips = [
  {
    id: '68e9b47f-89e4-47c8-9599-7f4b4c5a6017',
    fromLocation: {
      lat: 45.5016889,
      lng: -73.567256,
      googlePlaceId: 'ChIJDbdkHFQayUwR7-8fITgxTmU'
    },
    toLocation:{
      lat: 13.1059816,
      lng: -59.61317409999999,
      googlePlaceId: 'ChIJPflM-sL2Q4wRaXCGlWrmwX0'
    },
    fromDate: 1575090000,
    toDate: 1575090000,
    attachedRequests: [Requests[0]]
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
    trip: Trip
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

  input AttachRequestToTripInput {
    tripId: ID!
    requestId: ID!
  }

  type Query {
    myTrip(id: String): Trip!
    myTrips: [Trip]
    myRequest(id: String): Request!
    myRequests: [Request]
    myPackage(id: String): Package!
    getRequestsForLocation(placeId: String): [Request]
  }
  type Mutation {
    createTrip(input: TripInputObject): Trip!
    createRequest(input: RequestInputObject): Request!
    createPackage(input: PackageInputObject): Package!
    attachRequestToTrip(input: AttachRequestToTripInput): Trip!
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
    getRequestsForLocation: (_, { placeId }) => {
      return _Requests.filter((request) => request.toLocation.googlePlaceId === placeId)
    },
  },
  Mutation: {
    attachRequestToTrip: (_, {input}) => {
      const {tripId, requestId} = input;

      // get trip
      const trip = _Trips.filter((trip) => trip.id === tripId)[0]

      // Validation
      if (!trip) return console.log('Trip doesnt exist');

      // get trip index
      let tripIndex = _Trips.findIndex(trip => trip.id == tripId);

      // remove trip from array
      _Trips.splice(tripIndex, 1);

      // get request
      const request = _Requests.filter((request) => request.id === requestId)[0]

      // Validation
      if (!request) return console.log('Request doesnt exist');

      // get request index
      let requestIndex = _Requests.findIndex(request => request.id == requestId);

      // remove request from array
      _Requests.splice(requestIndex, 1);

      // Add trip to request
      request.trip = trip;

      // change request status
      request.status = 'ACCEPTED';

      // add to request trip.attachedRequests
      // trip.attachedRequests = [request]
      trip.attachedRequests.push(request)

      // push trip back to _Trips
      _Trips.push(trip);

      // push request back to _Requests
      _Requests.push(request);

      // return trip
      return trip
    },


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
        attachedRequests: []
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
        trip: null,
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
