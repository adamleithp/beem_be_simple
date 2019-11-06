const { GraphQLServer } = require('graphql-yoga')
const uuidv4 = require('uuid/v4')
const fetch = require('node-fetch')

const _Packages = [];
const _Trips = [];
const _Requests = [];
const _CounteredRequests = [];

const GOOGLE_API_KEY = 'AIzaSyAouQCTblqUO9VZAGPXOzvXVizG4r5fwfE'

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
    formattedAddress: String
  }
  type LocationSuggestion {
    id: ID
    description: String
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


  input CounteredRequestInputObject {
    request: RequestInputObject!
    trip: TripInputObject!
    price: PriceInputObject!
  }

  type CounteredRequest {
    id: ID!
    request: Request!
    trip: Trip!
    price: Price!
    counterStatus: Status!
  }

  input RequestInputObject {
    fromLocation: LocationInputObject!
    toLocation: LocationInputObject!
    offeredPrice: PriceInputObject!
    package: PackageInputObject
    counterOffers: CounteredRequestInputObject
  }

  type Request {
    id: ID!
    package: Package
    fromLocation: Location!
    toLocation: Location!
    offeredPrice: Price!
    status: Status!
    counterOffers: [CounteredRequest]
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
    counteredRequests: [CounteredRequest]
  }

  input AttachRequestToTripInput {
    tripId: ID!
    requestId: ID!
  }

  input AttachRequestInput {
    tripId: ID!
    requestId: ID!
    counterRequestId: ID!
  }

  input AttachCounterOfferToRequestInput {
    tripId: ID!
    requestId: ID!
    counterOffer: PriceInputObject!
  }

  type LocationObject {
    lat: String!
    lng: String!
  }

  type Query {
    myTrip(id: String): Trip!
    myTrips: [Trip]
    myRequest(id: String): Request!
    myRequests: [Request]
    myPackage(id: String): Package!
    getRequestsForLocation(placeId: String): [Request]

    getLocationSuggestions(locationString: String, typeOfLocationLookup: String): [LocationSuggestion]
    getLocationInformation(locationId: ID): Location
  }
  type Mutation {
    createTrip(input: TripInputObject): Trip!
    createRequest(input: RequestInputObject): Request!
    createPackage(input: PackageInputObject): Package!
    acceptCounterOfferAsRequester(input: AttachRequestInput): Request!
    attachRequestToTrip(input: AttachRequestToTripInput): Trip!
    attachCounterOfferToRequest(input: AttachCounterOfferToRequestInput): Trip!
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

    getLocationSuggestions: async (_, { locationString, typeOfLocationLookup }) => {
      console.log('locationString, typeOfLocationLookup', locationString, typeOfLocationLookup);

      // validation
      let typeOfLookUp;
      if (typeOfLocationLookup === 'geocode') typeOfLookUp = 'geocode';
      if (typeOfLocationLookup === 'establishment') typeOfLookUp = 'establishment';
      if (typeOfLocationLookup !== 'geocode' && typeOfLocationLookup !== 'establishment') return false;

      const locations = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${locationString}&types=${typeOfLookUp}&fields=formatted_address,name&language=en&key=${GOOGLE_API_KEY}`)
				.then((response) => {
					return response.json();
				})
				.then((json) => {
          return json.predictions;
        });

      const locationsFormatted = locations.map((location) => {
        return {
          id: location.place_id,
          description: location.description,
        }
      })

      return locationsFormatted
    },

    getLocationInformation: async (_, { locationId }) => {
			const locationInformation = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${locationId}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          return json.result;
        });

      return {
        lat: locationInformation.geometry.location.lat,
        lng: locationInformation.geometry.location.lng,
        googlePlaceId: locationId,
        formattedAddress: locationInformation.formatted_address
      };
    },

  },

  Mutation: {
    // rejectCounterOfferToRequest: (_, {input}) => {
    //   const {tripId, requestId, counterOffer} = input;
    // },

    // (requester action) Accept a counter offer (from traveller)
    acceptCounterOfferAsRequester: (_, {input}) => {
      const {tripId, requestId, counterRequestId} = input;

      // get trip
      const trip = _Trips.filter((trip) => trip.id === tripId)[0];
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
      // change request status to accepted
      request.status = 'ACCEPTED';

      // add to request trip.attachedRequests
      trip.attachedRequests.push(request)
      // Empty counter requests
      trip.counteredRequests = []

      // Get Counter request offer
      const counterRequest = _CounteredRequests.filter((counterRequest) => counterRequest.id === counterRequestId)[0]
      // Validation
      if (!counterRequest) return console.log('Counter Request doesnt exist');
      // get request index
      let counterRequestIndex = _CounteredRequests.findIndex(counterRequest => counterRequest.id == counterRequestId);
      // remove counter request from array
      _CounteredRequests.splice(counterRequestIndex, 1);
      // Update counter request
      counterRequest.counterStatus = 'ACCEPTED';
      // push counter request back to _CounteredRequests
      _CounteredRequests.push(counterRequest)

      // Empty original offerPrice,
      request.offeredPrice = {};
      // replace offer price with counterRequest Price after accepting
      request.offeredPrice = counterRequest.price;

      // push trip back to _Trips
      _Trips.push(trip);
      // push request back to _Requests
      _Requests.push(request);

      // return trip
      return request
    },

    // (traveller action) Counter offer request to my trip.
    attachCounterOfferToRequest: (_, {input}) => {
      const {tripId, requestId, counterOffer} = input;

      // get trip
      const trip = _Trips.filter((trip) => trip.id === tripId)[0];

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

      // Build counter offer
      const counterOfferObject = {
        id: uuidv4(),
        request: request,
        trip: trip,
        price: {
          currencyCode: counterOffer.currencyCode,
          amount: counterOffer.amount,
        },
        counterStatus: 'OFFERED' // or REJECTED or ACCEPTED
      }

      // Save counterOffer as own item
      _CounteredRequests.push(counterOfferObject);

      // Push counter offer to request
      request.counterOffers.push(counterOfferObject);

      // change request status to countered
      request.status = 'COUNTERED';

      // Push counter offer to trip
      trip.counteredRequests.push(counterOfferObject)

      // push trip back to _Trips
      _Trips.push(trip);

      // push request back to _Requests
      _Requests.push(request);

      // return trip
      return trip
    },

    // (traveller action) Accept Request to my trip.
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

      // change request status to accepted
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
        attachedRequests: [],
        counteredRequests: []
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
        counterOffers: [],
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
