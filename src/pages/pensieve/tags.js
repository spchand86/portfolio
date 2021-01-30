import React from 'react';
import { Link, graphql } from 'gatsby';
import kebabCase from 'lodash/kebabCase';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';

const StyledTagsContainer = styled.main`
  max-width: 1000px;

  h1 {
    margin-bottom: 50px;
  }
  ul {
    color: var(--light-slate);

    li {
      font-size: var(--fz-xxl);

      a {
        color: var(--light-slate);

        .count {
          color: var(--slate);
          font-family: var(--font-mono);
          font-size: var(--fz-md);
        }
      }
    }
  }
`;

const TagsPage = ({
  data: {
    wpTags: { edges },
  },
  location,
}) => (
  <Layout location={location}>
    <Helmet title="Tags" />

    <StyledTagsContainer>
      <span className="breadcrumb">
        <span className="arrow">&larr;</span>
        <Link to="/pensieve">All memories</Link>
      </span>

      <h1>Tags</h1>
      <ul className="fancy-list">
        {edges.map(tag => (
          <li key={tag.node.name}>
            <Link to={`/pensieve/tags/${kebabCase(tag.node.name)}/`} className="inline-link">
              {tag.node.name} <span className="count">({tag.node.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </StyledTagsContainer>
  </Layout>
);

TagsPage.propTypes = {
  data: PropTypes.shape({
    wpTags: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          count: PropTypes.number.isRequired,
        }).isRequired,
      ),
    }),
  }),
  location: PropTypes.object,
};

export default TagsPage;

export const pageQuery = graphql`
  query {
    wpTags: allWpTag {
      edges {
        node {
          name
          count
        }
      }
    }
  }
`;
