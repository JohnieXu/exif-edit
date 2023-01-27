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

/**
 * 设备型号（品牌）转换为图标路径
 * @param {String} M 设备型号-exif 数据中的 model
 * @returns 品牌对应的图标路径
 */
export const modelToIconPath = (M) => {
  const defaultIcon = leica
  if (!M) {
    return defaultIcon
  }
  const iconMap = {
    apple: apple,
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
  const matched = Object.keys(iconMap).filter((key) => M.toLocaleLowerCase().includes(key))
  if (!matched.length) {
    return defaultIcon
  }
  return iconMap[matched[0]]
}
