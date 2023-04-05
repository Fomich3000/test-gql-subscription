require('dotenv').config();

const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const express = require('express');
const http = require('http');

const pubsub = new PubSub();

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Subscription {
    time: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
  },
  Subscription: {
    time: {
      subscribe: () => {
        const channel = Math.random().toString(36).substring(2, 15); // Random channel name
        setInterval(() => pubsub.publish(channel, { time: new Date().toISOString() }), 5000); // Publish time updates every 5 second
        return pubsub.asyncIterator(channel);
      },
    },
  },
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
