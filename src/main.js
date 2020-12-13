const activities = {
  1: {
    id: 1,
    mediaId: 1,
  },
  2: {
    id: 2,
    mediaId: 2,
  },
  3: {
    id: 3,
    mediaId: 2,
  },
};

var { stitchSchemas, makeExecutableSchema } = require("graphql-tools");

const activitySchema = makeExecutableSchema({
  typeDefs: `
    type Media {
      id: Int!
    }
    type Activity {
      id: Int!
      media: Media!
    }
    type Query {
      Activities: [Activity!]!
    }
    `,
  resolvers: {
    Query: {
      Activities: () => Object.values(activities),
    },
    Activity: {
      media: ({ mediaId }) => ({ id: mediaId }),
    },
  },
});

const media = {
  1: { id: 1, title: { userPreferred: "Title 1" } },
  2: { id: 2, title: { userPreferred: "Title 2" } },
};

const mediaSchema = makeExecutableSchema({
  typeDefs: `
    type MediaTitle {
      userPreferred: String
    }
  
    type Media {
      id: Int!
      title: MediaTitle
    }
  
    type Query {
      Media(id_in: [Int!]!): [Media!]!
    }
  
    `,
  resolvers: {
    Query: {
      Media: (_, { id_in }) => id_in.map((id) => media[id]),
    },
  },
});

const schema = stitchSchemas({
  subschemas: [
    {
      schema: activitySchema,
    },
    {
      schema: mediaSchema,
      batch: true,
      merge: {
        Media: {
          selectionSet: "{ id }",
          fieldName: "Media",
          key: ({ id }) => id,
          argsFromKeys: (id_in) => ({ id_in }),
        },
      },
    },
  ],
});

const { graphql } = require("graphql");

graphql(
  schema,
  `
    query {
      Activities {
        id
        media {
          id
          title {
            userPreferred
          }
        }
      }
    }
  `
).then((result) => console.log(JSON.stringify(result)));

const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({ schema });

const APOLLO_PORT = 5000;

server
  .listen(APOLLO_PORT)
  .then(() =>
    console.log(
      `🚀 Apollo server ready at http://localhost:${APOLLO_PORT}${server.graphqlPath}`
    )
  );
