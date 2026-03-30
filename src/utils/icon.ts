import apple from '@/assets/icons/apple.png'
import canon from '@/assets/icons/canon.png'
import huawei from '@/assets/icons/huawei.png'
import leica from '@/assets/icons/leica.png'
import mi from '@/assets/icons/mi.png'
import nikon from '@/assets/icons/nikon.png'
import oppo from '@/assets/icons/oppo.png'
import realme from '@/assets/icons/realme.png'
import samsung from '@/assets/icons/samsung.png'
import sony from '@/assets/icons/sony.png'
import vivo from '@/assets/icons/vivo.png'

export const modelToIconPath = (model?: string | null): string => {
  const defaultIcon = leica
  if (!model) {
    return defaultIcon
  }
  const iconMap: Record<string, string> = {
    apple,
    iphone: apple,
    canon,
    fujifilm: defaultIcon,
    huawei,
    honor: defaultIcon,
    leica,
    meizu: defaultIcon,
    xiaomi: mi,
    redmi: mi,
    nikon,
    oppo,
    oneplus: defaultIcon,
    realme,
    samsung,
    sony,
    vivo,
  }
  const normalized = model.toLowerCase()
  const matched = Object.keys(iconMap).filter((key) => normalized.includes(key))
  if (!matched.length) {
    return defaultIcon
  }
  return iconMap[matched[0]]
}
