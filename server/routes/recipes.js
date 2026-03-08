import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { rows: recipes } = await pool.query(
      `SELECT id, product_id AS "productId", product_name AS "productName",
              yield::float, yield_unit AS "yieldUnit", prep_time AS "prepTime", notes
       FROM recipes ORDER BY product_name`
    )
    const { rows: ingredients } = await pool.query(
      `SELECT recipe_id AS "recipeId", supply_id AS "supplyId", supply_name AS "supplyName",
              quantity::float, unit
       FROM recipe_ingredients`
    )
    const ingByRecipe = ingredients.reduce((acc, ing) => {
      if (!acc[ing.recipeId]) acc[ing.recipeId] = []
      acc[ing.recipeId].push(ing)
      return acc
    }, {})
    res.json(recipes.map((r) => ({ ...r, ingredients: ingByRecipe[r.id] ?? [] })))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
