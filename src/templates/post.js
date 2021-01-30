import React from 'react';
import { Link, graphql } from 'gatsby';
import parse from 'html-react-parser';
import Image from 'gatsby-image';
import kebabCase from 'lodash/kebabCase';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Layout } from '@components';
import PropTypes from 'prop-types';

const StyledPostContainer = styled.main`
  max-width: 1000px;
`;
const StyledPostHeader = styled.header`
  margin-bottom: 50px;
  .tag {
    margin-right: 10px;
  }
`;
const StyledPostContent = styled.div`
  margin-bottom: 100px;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 2em 0 1em;
  }

  p {
    margin: 1em 0;
    line-height: 1.5;
    color: var(--light-slate);
  }
`;

const PostTemplate = ({ data, location }) => {
  const { previous, next, post } = data;
  const { title, date, tags } = post;
  const { tagNodes } = tags;
  const featuredImage = {
    fluid: post.featuredImage?.node?.localFile?.childImageSharp?.fluid,
    alt: post.featuredImage?.node?.alt || ``,
  };

  return (
    <Layout location={location}>
      <Helmet title={title} />

      <StyledPostContainer>
        <span className="breadcrumb">
          <span className="arrow">&larr;</span>
          <Link to="/pensieve">All Blog posts</Link>
        </span>

        <StyledPostHeader>
          <h1 className="medium-heading">{title}</h1>
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
        </StyledPostHeader>

        <article className="blog-post" itemScope itemType="http://schema.org/Article">
          <header>
            {featuredImage?.fluid && (
              <Image
                fluid={featuredImage.fluid}
                alt={featuredImage.alt}
                style={{ marginBottom: 20 }}
              />
            )}
          </header>
          <StyledPostContent>
            {!!post.content && <section itemProp="articleBody">{parse(post.content)}</section>}
          </StyledPostContent>

          <hr />
        </article>

        <nav className="blog-post-nav">
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
            }}>
            <li>
              {previous && (
                <Link to={previous.uri} rel="prev">
                  ← {parse(previous.title)}
                </Link>
              )}
            </li>

            <li>
              {next && (
                <Link to={next.uri} rel="next">
                  {parse(next.title)} →
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </StyledPostContainer>
    </Layout>
  );
};

export default PostTemplate;

PostTemplate.propTypes = {
  data: PropTypes.shape({
    previous: PropTypes.shape({
      title: PropTypes.string.isRequired,
      uri: PropTypes.string.isRequired,
    }),
    next: PropTypes.shape({
      title: PropTypes.string.isRequired,
      uri: PropTypes.string.isRequired,
    }),
    post: PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date).isRequired,
      excerpt: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      featuredImage: PropTypes.object,

      tags: PropTypes.shape({
        tagNodes: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
          }),
        ),
      }),
    }),
  }),
  location: PropTypes.object,
};

export const pageQuery = graphql`
  query BlogPostById(
    # these variables are passed in via createPage.pageContext in gatsby-node.js
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    # selecting the current post by id
    post: wpPost(id: { eq: $id }) {
      id
      excerpt
      content
      title
      date(formatString: "MMMM DD, YYYY")
      tags {
        tagNodes: nodes {
          name
        }
      }
      featuredImage {
        node {
          altText
          localFile {
            childImageSharp {
              fluid(maxWidth: 1000, quality: 100) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }

    # this gets us the previous post by id (if it exists)
    previous: wpPost(id: { eq: $previousPostId }) {
      uri
      title
    }

    # this gets us the next post by id (if it exists)
    next: wpPost(id: { eq: $nextPostId }) {
      uri
      title
    }
  }
`;
