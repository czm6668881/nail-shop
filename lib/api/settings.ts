import { getSiteSetting } from "@/lib/db/queries"
import { siteConfig } from "@/lib/config/site"

const WEAR_KEY = "how_it_works_wear_image"
const REMOVAL_KEY = "how_it_works_removal_image"

export async function getHowItWorksImages() {
  const [wear, removal] = await Promise.all([
    getSiteSetting(WEAR_KEY),
    getSiteSetting(REMOVAL_KEY),
  ])

  return {
    wearImage: wear?.value ?? siteConfig.howItWorksWearImagePath,
    removalImage: removal?.value ?? siteConfig.howItWorksRemovalImagePath,
  }
}
