const R = require('ramda')

const toRawCategories = R.map(R.prop('category'))

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
module.exports = async function seedContactCategories(prisma) {
  const contactCategoryCount = await prisma.contactCategory.count()

  if (contactCategoryCount > 0) {
    return
  }

  const contributors = await prisma.contributor.findMany()
  const leads = await prisma.lead.findMany()

  const contributorCategories = toRawCategories(contributors)
  const leadCategories = toRawCategories(leads)
  const contactCategoriesAsData = R.pipe(
    R.uniq,
    R.reject(R.equals(null)),
    R.map(category => ({ label: category })),
  )([...contributorCategories, ...leadCategories]).sort()

  await prisma.contactCategory.createMany({
    data: contactCategoriesAsData,
  })

  const contactCategories = await prisma.contactCategory.findMany()

  await Promise.all(
    contributors.map(async contributor => {
      if (contributor.category === null) {
        return
      }

      const contactCategory = R.find(R.propEq('label', contributor.category))(contactCategories)
      await prisma.contributor.update({
        data: {
          contactCategoryId: contactCategory.id,
        },
        where: {
          id: contributor.id,
        },
      })
    }),
  )

  await Promise.all(
    leads.map(async lead => {
      if (lead.category === null) {
        return
      }

      const contactCategory = R.find(R.propEq('label', lead.category))(contactCategories)
      await prisma.lead.update({
        data: {
          contactCategoryId: contactCategory.id,
        },
        where: {
          id: lead.id,
        },
      })
    }),
  )
}
