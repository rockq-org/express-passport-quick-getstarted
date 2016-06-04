'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var async = require('co').wrap;
var Article = mongoose.model('Article');

/**
 * List items tagged with a tag
 */

exports.index = async(function* (req, res) {
  const criteria = { tags: req.params.tag };
  const page = (req.params.page > 0 ? req.params.page : 1) - 1;
  const limit = 30;
  const options = {
    limit: limit,
    page: page,
    criteria: criteria
  };

  const articles = yield Article.list(options);
  const count = yield Article.count(criteria);

  res.render('articles/index', {
    title: 'Articles tagged ' + req.params.tag,
    articles: articles,
    page: page + 1,
    pages: Math.ceil(count / limit)
  });
});
