/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');
const _ = require('lodash');

const createTags = async ({ createPage, tagData, tagTemplate }) =>
  Promise.all(
    // Make tag pages
    tagData.forEach(nodeTag =>
      createPage({
        path: `/pensieve/tags/${_.kebabCase(nodeTag.node.name)}/`,
        component: tagTemplate,
        context: {
          tag: nodeTag.node.name,
        },
      }),
    ),
  );

const createIndividualBlogPostPages = async ({ createPage, postsData, postTemplate }) =>
  Promise.all(
    postsData.map(({ previous, post, next }) =>
      createPage({
        path: post.uri,
        component: postTemplate,
        context: {
          id: post.id,
          previousPostId: previous ? previous.id : null,
          nextPostId: next ? next.id : null,
        },
      }),
    ),
  );
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;
  const tagTemplate = path.resolve('src/templates/tag.js');
  const postTemplate = path.resolve('src/templates/post.js');

  const result = await graphql(`
    {
      wpTags: allWpTag {
        edges {
          node {
            name
          }
        }
      }
      allWpPost(sort: { fields: [date], order: DESC }) {
        edges {
          previous {
            id
          }

          # note: this is a GraphQL alias. It renames "node" to "post" for this query
          # We're doing this because this "node" is a post! It makes our code more readable further down the line.
          post: node {
            id
            uri
          }

          next {
            id
          }
        }
      }
    }
  `);

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }
  const tagData = result.data.wpTags.edges;
  await createTags({ createPage, tagData, tagTemplate });

  const postsData = result.data.allWpPost.edges;
  await createIndividualBlogPostPages({ createPage, postsData, postTemplate });
};

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
