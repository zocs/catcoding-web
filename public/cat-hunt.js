/**
 * CatCoding — Cat Hunting Mouse Animation (v4: Pillow Sprite)
 * Sprites generated with PIL/Pillow, embedded as base64 PNG data URLs
 * State machine: idle → stalking → pouncing → catching → victory
 */

;(function () {
  // ═══ Cat Sprites (Pillow-generated) ═══
  const SPRITES = {}
  const _raw = {
    orange_idle: "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",
    orange_pounce: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAEqUlEQVR4nO3dPXLbRhiA4WUmlT2u06WR69Q5RC5gp84JkmPYJ0gd+QI5ROrUduMutUdumYKDiETAJf4IfLv7PI0tjUBhNPtisQRIpgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMBMT48Px733oRNpX/bwzd47AJEJJKgIR+4I+7A3gQDleXp8OO55BN/790dhBoEMgQS3x1HczPFMIJAhkAJseUQ3e1wSCGQIpBBbHNnNHv8nEMgQSFAv33469L93zyP80GMP7UNrBAIZAinMPWYRa4/rBAIZAinQmkd8s0eeQCBDIIVa48hv9rjt2713gOtevv10GDuIj8fjuzE/dzgcfhv7u8f8XO0EUrCxUVzb5uuH1+vuUIUEUqAXbz6+H/r+1w+vf52yXff1re1aZhoN7vwUqz/Alw7s3OM5xTrxRwiuC+R8MK99xB96bIGchHwWy7Mrl+4ZR/8xr52+tSrkUeI8kNaPZN2ieqt1QhfI2Ge7ahdu8OVmj9Zi2TqOjkiehTzFGiKO7XS/c87TyLUpJpCW7BlHRyQnAgkm4oCMuE9bEUhQES7eRdiHvQkkkAinVn2tn2oJBDIEEkTE2aPT8iwiEMgQCGS43T2AOacuP/755b////XTq822PR6P71q6wm4GCWTs+qMb4H//8c/F1/fcNuLaaAvFBOIO35P+AJ8y0Jds26pwgbR2z9VcP/z83cW/W23bmnCB5JhFLtcM5wN8zFpiybatChmIWSSvP6CnDPAl27aouGexnh4fjgJaNrBFMV7IGSQlswgxFDeDpGQWueXL518uvn71/e877Un5ws4gKbU3i6z1hgn3CKLVN3MIHUhOTc9o3fPK9NqxtHQVPaUCAsnNIjVFsjanVesIH0jOlDd3bpFIlivqHP9aDLWsVaK+JqTltwEqegbpmEW4l6ICqX090h2hIz1j1PLskVKh10GGdOuRPU+31nxJ6os3H9/vfaoVKdS9FHvuvud6ZM/XZm8ZTeuzR0oVBpLSupFMiWHNwTvl6H2PaMRxUmwgKd0vkltRbP1O61M+nmCNfRPHs2oDSWl6JENhRFkH5PZjKJq5+y2OS0UH0lk6k/TD2DuKvikfoDP3Y9rOtxPHsyoCSWleJNHDODf1U6amhCKO66oJJKVpkfQ+DjlsGOfmzA65sPqPl4ujfzBpJaSqAklpXCRRb+kYa87HQOcW91PCmLJtDaoLJKV8JDV9NvjSC3m3Bndulm3ltKzKQFIajqSmOPqmxjJmUN+aaVt4xqvaQFK6jKTmOKYaM7DHnobWHklRNytO1a05arkdnu1VHUhK4mCZ6gOBJQQCGc0EEvHFSHsYu6ge8/eqfYGeUkOBpCSSuQN66O/Vyt+wyQVs6VfS55gbhyvpjSrxXqw51rri7V6sBpV0N+9UU25E5LqmA+nUFIow1iWQMxFfUTjG0IJZGOsQyIAor0kfcuvZI2GsSyA3lPCuJqK4H4HMsOf7YolhWwJZ0ZrhCAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgjH8B9E2EmOjMIcAAAAAASUVORK5CYII=",
    orange_leap: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAFOklEQVR4nO3dMY7cNhQGYE2QagPX6dJ4a9c5RC5gp84JvMewT+Da3gvkEKlTO40714a3nTRRoBUkjSQ+UpT0fYBhj7GaIRb89UhKQzUNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALA/3z+9vG7dhjE1t20vfti6AUdQY0essU17JCAwQUCC1HTGrqkteycgiX56889l6zaMqblteyEggWo4c9fQhiMREJggIMG2PIOrHvEEBCYISAZbnMlVjzwEBCYISCYlz+iqRz4CEqDG6w01tmmPBCSjEmd21SMvAYEJApJZzjO86pGfgMAEASkgx5le9ShDQAqJ7NDCUY6AwAQBCTLnukPEmX/Oe7gGEufHrRtwZtfr9d2cn7tcLg+528IwASlsbijGjnl6vI9tEJMEpJC715/fD/3/0+P92yXHta9vHUcMY9VAQ/ODfgdP7dhz3s8cJI5fZKB+QLqdOfqMP/XeAhLHKlYmOcPRf8+x4RvpnGkCtRWk9Dyh/3kqSBy/yGDtilPpSXQbEkvCsQyxAm0Vju5nrllGZpyABNkyHC0hiScgAWrskDW2aY8EJFANF+9qaMORCEiiGoZWfYZacQQEJghIghqrR0sViSEgMEFAYILb3VdaM3T59c9v///7r99eFDv2er2+c4V9HRUk0dz5R9vB//749dnrnMfWODfaGwEpoN/Bl3T0lGNJJyAFvfr952d/lzqW9QSkgO6codvB58wlUo4lnYAU0u/QSzp4yrGksYpVUErHFoptqCAwQQWpxLcvfzx7/eKXDxu1hC4VJFHUhgk5AmEzh3QCslLOK9PRYXEVfT0BqYhhVX3MQQq7Ney5a5rm6fGDW0QqYdufRLe+ExIxD1hzT5VtgGKoIJms3ax66FgbVm9HBQnQrSLRm1U3zfINsFWPOAISYOi7ITnO9nOC0v0ZAUknIAF6D7jJPgya2hhb9YhlmTdRv3qUuDg3trO7cMRTQRIMrWBttbN7SzhiCchKU8u7W4Xkcrk8jH1XXnDWEZAV5uyHlfsBOv3PmEtQlhGQhZZMyEs9gq3P6lYcAVlo6W6KuR/i2X3fOUM7E/llBGSBlK1Gox4D3T1uKBBCEsutJoW0HXbsNpKl70MZAjLh+6eX1/aBmFEbVa95Ou2Sz2wry93rz++FKZ2A3NB59nn4BUAduH6upI/oBKNaY8O2KeYfy5ikj+gGpPbbzYeWk/tttsy7joD0DFWO2gPSNPOriHAsYw5yELeGW4KxjoB07GHecUs/KIKRxiT9P2PhaJd5OScBgQkC0qgejBOQEcJB0wjIISbm5HP6gAzpV492JWgvm0FbwYpz6oCoHtxy6oAMMfeg67QBWVo99jLMMryKdcqAWNZlrlMGZK3aq4jqEe90AYmqHrWFpLb2HMXpAjJkSThqPzvX3r69OdWYO3Lu0f+Oeo7HHsxlaJXP6QOSMjEf2+azK3dQhCOv03wfpMRFwaEdS3LtLuIrtGWceg4SUT3GtvF5erx/u2ZThTmEo5xTByRKPyS5VpT67y0c+Z1mDhI5/5jz6IPW3D1zp3gGyHZOEZBck/O5jz/oWvOU25ZglHeaSXppUXvxNo1gbMkcJLNuxZjb0S+Xy0P3T77WccvhK0ht3/nQ4ffllBUk9a7dJTctupC3b6cMCMx1+FWs6BWsrqnnFbpecQwCkujW/VjCsW+Hn6Tn1gagHxTBOAYBCSIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIf1LxG74Ha7m5XwAAAAAElFTkSuQmCC",
    white_idle: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAGaUlEQVR4nO3dO44VRxQG4LqWJZZANgRDOrMKR8iBLZGxDIgdOIZlkCHZgeXIqxhSCCBjCUTtYGhN3zv9fp7q/r6EGUa3u/qq/j5V/UwJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ECKoni7dRvmsqdtWdpPWzcgJ3voWHvYhjUJCDCPoije5rwHzr39W1BBRsixk+XY5ggEBFoIyEg57ZFzams0AjLA6XR6s3UbptrDNqxJQCbIYc+cQxsjE5CJInfAyG3LhYCM9PXzx9dbt6GvnNoajYDMIOKeOmKbciQgA5WT3Kvrm3fVPXOkDllty9fPH19fXd+8S8kEfQwBmSjy8CVy23IhIDOKUEUitGFPBGQGEffUEduUIwEZoW0sv+UevG3d5h/jCMgE5eQ3pfM99hYhuZyYlz9X28hwAjKjCMOaCG3YEwFZyJpVxMR8OQIys7WHWk1DK+YhICNVTxhe/m2Ljlq3TicIpxOQhS1ZRQytlvfz1g3Yq+olHk36dvCuCmBotRwBWUFRFG9Pp9ObsXv8y89NWRbDCMiCqlWkrkP33fNfViIT8/Wctm5A7srO2jZJrpraofsu0wR9HibpC1nzDLaz5csRkJldXd+8u7wEZa5LP7qWKyjzE5AZtXXgOecKl8t17dVysgzIl093xdZtKNWdMOwKw5hO3PWZupCYf0yXXUDKcEQKSVVbOOaoIksvn3PZHcW6DMaz57ebbkPb+YiuI1tjDvP2PVpWUkWmySogTVVjy5A0HeZt6rSXZ9iHDMfazs43rV9ApskmIF1Dqi1C0nYOpM6Y8yJTzqUIyXThA9JnrpFDOJpcPj6o79+GLD8lIRkr9CQ96kR8TibdsYUOSB85V481lG10ceM4YS9WjDjn4HhCVpAvn+6KtgBEPGoVmSoyXsiApBTzkC7HEy4gR5iYk4+wc5A9+fWPX85+/+fP/zZdDv2FqyBtth5ejZl/lJ367v23dPf+29n/DTF1OeYh44QKyN7mHdVOXRrTuedaDsOFCkhTELqOasFSwgTky6e7Ym8VpHT76mntz1sth/7CBGSPqpPo21dPzzr1kAn2XMthOAFZWF0HHtOp51oOwzjMu4K5OrJArC9EBXFykKhCVJDqJHytW2qLovit6W+n0+nvJdaZA9/LuRBHh6JdudvWSZp8/fzxrynrfPLh37Pfv798MWVx6er65vcxnztiCNqEqCDRtHWSlnvQGztkn/B8f/niUUi6DFmnOwvHCRGQZ89vT2vPQ8ZUiTZTK0hV3+oxdp1jt/2I1SXEECul9mFWpBOFSw+/nnz4t3dADKOWF+IoFg+mzj2YV4gh1hamDDOi3FXYtzJdzj8MsfoLM3SJdiSrS5SQdDE5n8YQC1qECUi0CtGl7TXQUage04UJSKntnpC129IlckiEYx7h9tq5zkVS6jcfmRqmoesQkGlCdbbSHkKydlWpW69wTBeqo5WiPrC6Td+HISzxlts6wjGPUJ2sKocqMvTlOUvyEp1lbN7J2kQMSVMomoZWSwelaX1NgRGWYUIHJKU4IakLRlvnH/OqtaH6rqMuLILST/iApLR9SC7DseQbpZZc5uVnhaTbLgKS0jIhGXoIt0nf9wou9fmuZQpKsywCktL6IZkrHFVzHfpdoj1CUi+bgKS0TkiWCEaTvoFZsx2Cci6rgKS0bEjWDEc0QlIv3LVYXfp0/jHXbR05HCmdb7MnwD/ILiApLReSlI4ZjtKRt71JlgFJad6Q5HLz0xq8R+RctgFJaZ6QCMdjQvIg64Ck1D8kEe8nIb7sA5JS/6NWlyGxh+x29O9oFwFJaVhILoNiePWY7+TebgKS0n1IxlYTqLOrgJQi3CvCPuwyICkJCfPYbUBSGjbkgjq7DkipKyQRH9uzNd/JvUMEJKX6kDhS0+3oFy4eJiApPQ6J4RddDhWQlB5CUf4b+emIW/FUxgf2oD+4JuuecJw7XAXpcuRKcuRtbyIgP1T3mEfsKO4orCcgFUcNiXA0MwdpcIRbcAWjmwrSYO/VRDj6UUF6GPtkxWg8WXE4Aelp6LN5I/Fs3vEEZKCup7tH4enu8xCQCbwfZP8EZCbeMLVPArKQtR92IBDLEJCVTQ2OIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACklFL6H0skAyjl75DpAAAAAElFTkSuQmCC",
    white_pounce: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAEqUlEQVR4nO3dv5LbRBzA8TXDDI9AlxRJm3sKKoYyHY8BNQV18hh0lAwVT3FpL8Wl4xGoTOERZwt5rX+Wfrv7+TTJ3Zx8mpv9arWWbKcEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADATM9Pj8e996ETaV/28NXeOwCRCSSoCEfuCPuwN4EA5Xl+ejzueQTf+/dHYQaBDIEEt8dR3MzxQiCQIZACbHlEN3tcEghkCKQQWxzZzR7/JxDIEEhQr98+HPrfu+cRfuixh/ahNQKBDIEU5h6ziLXHdQKBDIEUaM0jvtkjTyCQIZBCrXHkN3vc9vXeO8B1r98+HMYO4uPx+GHMzx0Oh5/H/u4xP1c7gRRsbBTXtvny+dO6O1QhgRTo1Zt3H4e+/+Xzp5+mbNd9fWu7lplGgzs/xeoP8KUDO/d4TrFO/BGC6wI5H8xrH/GHHlsgJyGfxfLsyqV7xtF/zGunb60KeZQ4D6T1I1m3qN5qndAFMvbZrtqFG3y52aO1WLaOoyOSFyFPsYaIYzvd75zzNHJtigmkJXvG0RHJiUCCiTggI+7TVgQSVISLdxH2YW8CCSTCqVVf66daAoEMgQQRcfbotDyLCAQyBAIZbncPYM6pyw+/fPff///49a/Ntj0ejx9ausJuBglk7PqjG+CPv/198fU9t424NtpCMYG4w/ekP8CnDPQl27YqXCCt3XM118OP3178u9W2rQkXSI5Z5HLNcD7Ax6wllmzbqpCBmEXy+gN6ygBfsm2LinsW6/np8SigZQNbFOOFnEFSMosQQ3EzSEpmkVu++f3Pi6//ef/9TntSvrAzSErtzSJrvWHCPYJo9c0cQgeSU9MzWve8Mr12LC1dRU+pgEBys0hNkazNadU6wgeSM+XNnVskkuWKOse/FkMta5Worwlp+W2Aip5BOmYR7qWoQGpfj3RH6EjPGLU8e6RU6HWQId16ZM/TrTVfkvrqzbuPe59qRQp1L8Weu++5HtnztdlbRtP67JFShYGktG4kU2JYc/BOOXrfIxpxnBQbSEr3i+RWFFu/0/qUjydYY9/E8aLaQFKaHslQGFHWAbn9GIpm7n6L41LRgXSWziT9MPaOom/KB+jM/Zi28+3E8aKKQFKaF0n0MM5N/ZSpKaGI47pqAklpWiS9j0MOG8a5ObNDLqz+4+Xi6B9MWgmpqkBSGhdJ1Fs6xprzMdC5xf2UMKZsW4PqAkkpH0lNnw2+9ELercGdm2VbOS2rMpCUhiOpKY6+qbGMGdS3ZtoWnvGqNpCULiOpOY6pxgzssaehtUdS1M2KU3Vrjlpuh2d7VQeSkjhYpvpAYAmBQEYzgUR8MdIexi6qx/y9al+gp9RQICmJZO6AHvp7tfI3bHIBW/qV9DnmxuFKeqNKvBdrjrWueLsXq0El3c071ZQbEbmu6UA6NYUijHUJ5EzEVxSOMbRgFsY6BDIgymvSh9x69kgY6xLIDSW8q4ko7kcgM+z5vlhi2JZAVrRmOEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACONfrsCU7FwrnKYAAAAASUVORK5CYII=",
    white_leap: "iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAFMElEQVR4nO3dsZLcNBgH8F2GGR6BLhShvTwFFUNJx2MkM3QU1Mlj0FEyVDzFpc0VuY5HoFoazPg8tta2Psmy/fs1yWXiXc2N/v4keVe6XAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA/fn86fG2dRumtNy2vfhi6wYcQYsdscU27ZGAQIKABGnpjt1SW/ZOQDJ98+2b69ZtmNJy2/ZCQAK1cOduoQ1HIiCQICDBtryDqx7xBAQSBKSALe7kqkcZAgIJAlJIzTu66lGOgARo8XlDi23aIwEpqMadXfUoS0AgQUAKK3mHVz3KExBIEJAKStzpVY86BKSSyA4tHPUICCQISJA5zx0i7vxzXsMzkDhfbt2AM7vdbu/n/L/r9fqudFsYJyCVzQ3F1DXPTx9jG0SSgFTy6vXDh7F/f376+HbJdd3P964jhrFqoLH5wbCD53bsOa9nDhLHLzLQMCD9zhx9x0+9toDEsYpVSMlwDF9zavhGPneaQF0FqT1PGL6fChLHLzJYt+JUexLdhcSScCxDrEBbhaP/nmuWkZkmIEG2DEdHSOIJSIAWO2SLbdojAQnUwsO7FtpwJAKSqYWh1ZChVhwBgQQBydBi9eioIjEEBBIEBBJ83H2lNUOXH3757v+///HrX9Wuvd1u7z1hX0cFyTR3/tF18Mff/n7xc8lrW5wb7Y2AVDDs4Es6es615BOQit789PWLP2tdy3oCUkF/ztDv4HPmEjnXkk9AKhl26CUdPOda8ljFqiinYwvFNlQQSFBBGvHV73+++PmfH7/fqCX0qSCZojZMKBEImznkE5CVSj6Zjg6Lp+jrCUhDDKvaYw5S2d1hz88PPiLSENv+ZLr3nZCIecCawNgGKIYKUsjazarHrrVh9XZUkAD9KhK9WfXlsnwDbNUjjoAEGPtuSIm7/Zyg9P+PgOQTkACDA26KD4NSG2OrHrEs82YaVo8aD+emdnYXjngqSIaxFaytdnbvCEcsAVkptby7VUiu1+u7qe/KC846ArLCnP2wSh+gM3yPuQRlGQFZaMmEvNYRbENWt+IIyEJLd1MsfYhn/3XnDO1M5JcRkAVythqNOga6f91YIIQklo+aVNJ12KmPkSx9HeoQkITPnx5v3YGYURtVrzmddsl7dpXl1euHD8KUT0Du6J19Hv4AUAdunyfpE3rBaNbUsC3F/GMZk/QJ/YC0/nHzseXkYZst864jIANjlaP1gFwu86uIcCxjDnIQ94ZbgrGOgPTsYd5xzzAogpHHJP0/U+Holnk5JwGBBAG5qB5ME5AJwsHlIiCHmJhTzukDMmZYPbqVoL1sBm0FK86pA6J6cM+pAzLG3IO+0wZkafXYyzDL8CrWKQNiWZe5ThmQtVqvIqpHvNMFJKp6tBaS1tpzFKcLyJgl4Wj97tx6+/bmVGPuyLnH8DvqJY49mMvQqpzTByRnYj61zWdf6aAIR1mn+T5IjYeCYzuWlNpdxFdo6zj1HCSiekxt4/P89PHtmk0V5hCOek4dkCjDkJRaURq+tnCUd5o5SOT8Y87RB525e+amOANkO6cISKnJ+dzjD/rWnHLbEYz6TjNJry1qL97LRTC2JCCF9YdYqROg+gSiHYcPSGvf+dD59+WUq1i5n9pd8qFFD/L27ZQBgbkOv4oVvYLVlzqv0POKYxCQTPcm3cKxb4efpJfWBWAYFME4BgEJIhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAh/Uv7n/0DhFu/TQAAAAASUVORK5CYII=",
  }

  // Load sprites as Image objects
  const _imgs = {}
  let _loaded = 0, _total = Object.keys(_raw).length
  for (const [k, v] of Object.entries(_raw)) {
    const img = new Image()
    img.onload = () => { _loaded++; _imgs[k] = img }
    img.src = "data:image/png;base64," + v
  }

  const canvas = document.createElement("canvas")
  canvas.id = "cat-hunt-canvas"
  Object.assign(canvas.style, {
    position: "fixed", top: "0", left: "0",
    width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: "9999",
  })
  document.body.prepend(canvas)
  const ctx = canvas.getContext("2d")
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
  resize()
  window.addEventListener("resize", resize)

  let mouseX = canvas.width / 2, mouseY = canvas.height / 2, mouseOnPage = false

  // ═══ Main Cat State Machine ═══
  const cat = {
    x: 100, y: 0, state: "idle", stateTimer: 0, facing: 1,
    size: 80, crouch: 0, pounceCharge: 0, victoryDance: 0,
    breathPhase: 0, tailAngle: 0, distToMouse: 999,
    caughtTimer: 0, homeX: 100, homeY: 0,
    get spriteKey() {
      if (this.state === "pouncing" || this.state === "catching") return "orange_pounce"
      if (this.state === "victory") return "orange_leap"
      return "orange_idle"
    }
  }
  function updateCatHome() { cat.y = canvas.height - cat.size * 0.7; cat.homeY = cat.y; cat.homeX = cat.size }
  updateCatHome()
  window.addEventListener("resize", updateCatHome)

  // ═══ Ambient Cats ═══
  const ambient = [
    { x: -50, y: 0, vx: 0.4, size: 56, key: "white_idle", facing: 1, opacity: 0.3, phase: 0 },
    { x: 999, y: 0, vx: -0.3, size: 46, key: "white_pounce", facing: -1, opacity: 0.22, phase: 3 },
  ]
  function updateAmbientY() { for (const a of ambient) a.y = canvas.height - a.size * 0.6 }
  updateAmbientY()
  window.addEventListener("resize", updateAmbientY)

  function updateCat() {
    cat.stateTimer++; cat.breathPhase += 0.04; cat.tailAngle += 0.04
    const dx = mouseX - cat.x, dy = mouseY - cat.y
    cat.distToMouse = Math.sqrt(dx*dx + dy*dy); cat.facing = dx > 0 ? 1 : -1
    switch (cat.state) {
      case "idle": cat.crouch = 0
        if (mouseOnPage && cat.distToMouse < 400) { cat.state = "stalking"; cat.stateTimer = 0 }
        cat.x += (cat.homeX - cat.x) * 0.01; cat.y += (cat.homeY - cat.y) * 0.01; break
      case "stalking": cat.crouch = Math.min(cat.crouch + 0.02, 0.7)
        cat.x += (mouseX - cat.x) * 0.02; cat.y += (mouseY - cat.y) * 0.02
        if (cat.distToMouse < 80) { cat.state = "pouncing"; cat.stateTimer = 0; cat.pounceCharge = 0 }
        if (!mouseOnPage || cat.distToMouse > 600) { cat.state = "idle"; cat.stateTimer = 0 }; break
      case "pouncing": cat.crouch = 1; cat.pounceCharge = Math.min(cat.pounceCharge + 0.025, 1)
        if (cat.pounceCharge >= 1) { cat.state = "catching"; cat.stateTimer = 0; cat.caughtTimer = 0 }; break
      case "catching": cat.crouch = Math.max(cat.crouch - 0.08, 0)
        cat.x += (mouseX - cat.x) * 0.15; cat.y += (mouseY - cat.y) * 0.15
        if (cat.distToMouse < 25) { cat.caughtTimer++; if (cat.caughtTimer > 120) { cat.state = "victory"; cat.stateTimer = 0; cat.victoryDance = 0; spawnBurst() } }
        else cat.caughtTimer = Math.max(0, cat.caughtTimer - 2)
        if (cat.stateTimer > 180) { cat.state = "stalking"; cat.stateTimer = 0 }; break
      case "victory": cat.victoryDance += 0.08; cat.crouch = 0
        cat.y = cat.homeY + Math.abs(Math.sin(cat.victoryDance * 2)) * -12
        cat.x += Math.sin(cat.victoryDance * 3) * 1.2
        if (cat.stateTimer > 200) { cat.state = "returning"; cat.stateTimer = 0 }; break
      case "returning": cat.crouch = 0
        cat.x += (cat.homeX - cat.x) * 0.03; cat.y += (cat.homeY - cat.y) * 0.03
        if (Math.abs(cat.x - cat.homeX) < 5 && Math.abs(cat.y - cat.homeY) < 5) { cat.state = "idle"; cat.stateTimer = 0 }; break
    }
  }

  // ═══ Particles ═══
  const victoryParticles = []
  function spawnBurst() {
    const em = ["⭐","🎉","🐟","✨","🐾","💛"]
    for (let i = 0; i < 20; i++) { const a = Math.PI*2*i/20+Math.random()*0.3, sp = 2+Math.random()*4
      victoryParticles.push({ x: cat.x, y: cat.y-20, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp-2,
        life: 0, max: 60+Math.random()*30, emoji: em[Math.floor(Math.random()*em.length)],
        size: 12+Math.random()*10, rot: Math.random()*6.28, rotV: (Math.random()-0.5)*0.1 })
    } }

  function drawCursor() {
    if (!mouseOnPage) return
    const stalked = cat.state === "stalking" || cat.state === "pouncing"
    ctx.save(); ctx.translate(mouseX, mouseY)
    if (stalked) { ctx.globalAlpha = 0.7; ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.fillText("🐟", 0, 6) }
    else { const p = 1 + Math.sin(Date.now()*0.003)*0.05; ctx.scale(p,p); ctx.globalAlpha = 0.5; ctx.font = "16px serif"; ctx.textAlign = "center"; ctx.fillText("🧶", 0, 5) }
    ctx.restore()
  }

  // ═══ Main Loop ═══
  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Ambient cats
    for (const a of ambient) {
      a.x += a.vx; a.phase += 0.05
      if (a.vx > 0 && a.x > canvas.width + 60) { a.x = -60; a.facing = 1 }
      if (a.vx < 0 && a.x < -60) { a.x = canvas.width + 60; a.facing = -1 }
      const img = _imgs[a.key]
      if (img) {
        ctx.save(); ctx.globalAlpha = a.opacity; ctx.translate(a.x, a.y + Math.sin(a.phase)*2)
        ctx.scale(a.facing, 1)
        ctx.drawImage(img, -a.size/2, -a.size/2, a.size, a.size)
        ctx.restore()
      }
    }

    // Main cat
    updateCat()
    const img = _imgs[cat.spriteKey]
    if (img) {
      ctx.save(); ctx.translate(cat.x, cat.y); ctx.scale(cat.facing, 1)
      const breathe = Math.sin(cat.breathPhase) * 1.5
      ctx.drawImage(img, -cat.size/2, -cat.size/2 + breathe, cat.size, cat.size)
      ctx.restore()
    }

    // State label
    const labels = { idle: "", stalking: "🐾 stalking...", pouncing: "⚡ charging...", catching: "💨 POUNCE!", victory: "🎉 caught!", returning: "" }
    if (labels[cat.state]) { ctx.save(); ctx.globalAlpha = 0.7; ctx.font = "12px Inter,sans-serif"; ctx.fillStyle = "#f5a623"; ctx.textAlign = "center"; ctx.fillText(labels[cat.state], cat.x, cat.y - cat.size/2 - 10); ctx.restore() }

    // Victory particles
    for (let i = victoryParticles.length-1; i >= 0; i--) { const p = victoryParticles[i]
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life++; p.rot += p.rotV
      if (p.life > p.max) { victoryParticles.splice(i,1); continue }
      ctx.save(); ctx.globalAlpha = 1-p.life/p.max; ctx.translate(p.x,p.y); ctx.rotate(p.rot)
      ctx.font = p.size+"px serif"; ctx.textAlign = "center"; ctx.fillText(p.emoji,0,0); ctx.restore() }

    drawCursor()
    requestAnimationFrame(frame)
  }

  // ═══ Events ═══
  document.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; mouseOnPage = true })
  document.addEventListener("mouseleave", () => { mouseOnPage = false })
  document.addEventListener("touchmove", e => { const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true }, { passive: true })
  document.addEventListener("touchstart", e => { const t = e.touches[0]; mouseX = t.clientX; mouseY = t.clientY; mouseOnPage = true }, { passive: true })
  document.addEventListener("touchend", () => { mouseOnPage = false })
  requestAnimationFrame(frame)
})()