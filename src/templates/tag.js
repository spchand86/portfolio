import React from 'react';
import { Link, graphql } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledTagsContainer = styled.main`
  max-width: 1000px;

  a {
    ${({ theme }) => theme.mixins.inlineLink};
  }

  h1 {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 50px;

    a {
      font-size: var(--fz-lg);
      font-weight: 400;
    }
  }

  ul {
    li {
      font-size: 24px;
      h2 {
        font-size: inherit;
        margin: 0;
        a {
          color: var(--light-slate);
        }
      }
      .subtitle {
        color: var(--slate);
        font-size: var(--fz-sm);

        .tag {
          margin-right: 10px;
        }
      }
    }
  }
`;

const TagTemplate = ({ pageContext, data, location }) => {
  const { tag } = pageContext;
  const { edges } = data.allWpPost;

  return (
    <Layout location={location}>
      <Helmet title={`Tagged: #${tag}`} />

      <StyledTagsContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/pensieve">All blogs</Link>
        </span>

        <h1>
          <span>#{tag}</span>
          <span>
            <Link to="/pensieve/tags">View all tags</Link>
          </span>
        </h1>

        <ul className="fancy-list">
          {edges.map(({ node }) => {
            const { title, uri, date, tags } = node;
            const { tagNodes } = tags;
            return (
              <li key={uri}>
                <h2>
                  <Link to={uri}>{title}</Link>
                </h2>
                <p className="subtitle">
                  <time>
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>&nbsp;&mdash;&nbsp;</span>
                  {tagNodes &&
                    tagNodes.length > 0 &&
                    tagNodes.map((tag, i) => (
                      <Link key={i} to={`/pensieve/tags/${kebabCase(tag.name)}/`} className="tag">
                        #{tag.name}
                      </Link>
                    ))}
                </p>
              </li>
            );
          })}
        </ul>
      </StyledTagsContainer>
    </Layout>
  );
};

export default TagTemplate;

TagTemplate.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
  }),
  data: PropTypes.shape({
    allWpPost: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            slug: PropTypes.string.isRequired,
            date: PropTypes.instanceOf(Date).isRequired,
            uri: PropTypes.string.isRequired,
            tags: PropTypes.shape({
              tagNodes: PropTypes.shape({
                name: PropTypes.string.isRequired,
                uri: PropTypes.string.isRequired,
              }),
            }),
          }),
        }).isRequired,
      ),
    }),
  }),
  location: PropTypes.object,
};

export const pageQuery = graphql`
  query MyQuery($tag: String!) {
    allWpPost(
      limit: 2000
      sort: { fields: date, order: DESC }
      filter: { tags: { nodes: { elemMatch: { name: { in: [$tag] } } } } }
    ) {
      edges {
        node {
          id
          title
          slug
          date
          uri
          tags {
            tagNodes: nodes {
              name
              uri
            }
          }
        }
      }
    }
  }
`;
