const { buildSchema } = require('graphql');


module.exports = buildSchema(`
    type TextData {
        text: String!
        views: Int!
    }

    type RootQuery {
        hello: TextData!
    }
   schema {
        query: RootQuery
   } 
`);
