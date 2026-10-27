import { randomUUID } from "node:crypto";
import type { EntityManager } from "typeorm";
import { In } from "typeorm";
import { Category } from "../../category/category.entity.js";
import type { CategorySeed } from "./catalog-seed-data.js";

export async function seedCategories(
  manager: EntityManager,
  categories: CategorySeed[],
): Promise<Map<number, string>> {
  const repository = manager.getRepository(Category);
  if (categories.length === 0) {
    return new Map();
  }

  const existingCategories = await repository.findBy({
    sourceId: In(categories.map(({ sourceId }) => sourceId)),
  });
  const existingBySourceId = new Map(
    existingCategories.map((category) => [category.sourceId, category]),
  );
  const categoryIds = new Map(
    categories.map((category) => [
      category.sourceId,
      existingBySourceId.get(category.sourceId)?.id ?? randomUUID(),
    ]),
  );
  const rows = categories.map((category) => {
    return {
      id: categoryIds.get(category.sourceId)!,
      sourceId: category.sourceId,
      parentId: null,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
    };
  });

  for (let offset = 0; offset < rows.length; offset += 100) {
    await repository.save(rows.slice(offset, offset + 100));
  }

  for (const category of categories) {
    if (category.parent === 0) {
      continue;
    }
    const id = categoryIds.get(category.sourceId);
    const parentId = categoryIds.get(category.parent);
    if (!id || !parentId) {
      throw new Error(
        `No category ID found for source ID ${category.parent} or ${category.sourceId}`,
      );
    }
    await repository.update({ id }, { parentId });
  }

  return categoryIds;
}
