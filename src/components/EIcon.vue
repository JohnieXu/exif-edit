<script>
import { createBEM } from '../utils/className'
import { iconMap } from './data'

const bem = createBEM("e-icon")

const models = 'xiaomi,redmi,huawei,honor,iphone,oppo,meizu,realme,oneplus,samsung,canon,nikon,sony,fujifilm,leica'.split(',')

export default {
  name: "EIcon",
  functional: true,
  props: {
    name: {
      type: String,
      required: true
    },
  },
  // data () {
  //   return {
  //     iconMap
  //   }
  // },
  methods: {
    bem
  },
  render (h, context) {
    if (!context.props.name) {
      return <span class={[bem(), context.data.class]}></span>
    }
    const matches = models.filter((model) => {
      return context.props.name.toLocaleLowerCase().includes(model)
    })
    const isModelMatch = matches.length > 0
    const hasRender = iconMap[context.props.name] || iconMap[matches[0]]
    if (!hasRender) {
      return <span class={[bem(), context.data.class]}></span>
    }
    if (isModelMatch) {
      return (
        <span class={[bem(), context.data.class]}>{iconMap[matches[0]](h)}</span>
      )
    } else {
      return (
        <span class={[bem(), context.data.class]}>{iconMap[context.props.name](h)}</span>
      )
    }
  }
}
</script>

<style>
.pe_e-icon {
  flex: 0 0 14px;
  line-height: 1;
  font-size: 0;
  margin-right: 6px;
}
.pe_e-icon svg {
  width: 14px;
  height: auto;
}
.pe_e-icon span {
  font-size: 14px;
}
</style>
