'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories',
        ['Chinese Cuisine', 'Japanese Cuisine', 'Italian Cuisine', 'Mexican Cuisine', 'Vegetarian Cuisine', 'American Cuisine', 'Complex Cuisine']
            .map((item, index) =>
                ({
                  id: index * 10 + 1,
                  name: item,
                  createdAt: new Date(),
                  updatedAt: new Date()
                })
            ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', null, {})
  }
}