const { SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY } = process.env

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export default async function seedContactCategories(prisma) {
  if (!SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY) {
    console.error('Fatal: `SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY` env is undefined.')
    process.exit(1)
  }

  const maybeContactCategory = await prisma.contactCategory.findUnique({
    where: {
      label: SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
    },
  })

  if (maybeContactCategory !== null) {
    return
  }

  await prisma.contactCategory.create({
    data: {
      description:
        'Cette catégorie est protégée car elle sert de valeur par défaut ' +
        "pour les contacts qui n'ont pas de catégorie définie lors des synchronisations avec Tell Me.",
      label: SYNCHRONIZATION_FALLBACK_CONTACT_CATEGORY,
    },
  })
}
