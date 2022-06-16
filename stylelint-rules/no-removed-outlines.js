/**
 * More background behind this rule:
 * https://piccalil.li/quick-tip/use-transparent-borders-and-outlines-to-assist-with-high-contrast-mode/
 */

const stylelint = require('stylelint')
const { report, ruleMessages, validateOptions } = stylelint.utils

const ruleName = 'digital-plugin/no-removed-outlines'
const messages = ruleMessages(ruleName, {
  error:
    'Do not remove outlines. Set them to be transparent instead. Removing outlines makes focus indicators inaccessible in high contrast modes.',
})

module.exports.ruleName = ruleName
module.exports.messages = messages
module.exports = stylelint.createPlugin(
  ruleName,
  function ruleFunction(primaryOption) {
    return function lint(postcssRoot, postcssResult) {
      // Don't lint if the rule isn't enabled
      if (primaryOption !== true) {
        return
      }

      // Check if the options are valid
      const hasValidOptions = validateOptions(postcssResult, ruleName, {
        // No options for now...
      })

      // Don't lint if the options aren't valid
      if (!hasValidOptions) {
        return null
      }

      /**
       * Traverse descendant nodes that specify the `outline`, `outline-width`,
       * or `outline-style` properties.
       *
       * ref: https://postcss.org/api/#atrule-walkdecls
       */
      postcssRoot.walkDecls(
        /^(outline|outline-width|outline-style)$/,
        (decl) => {
          const { prop, value } = decl

          // Split for `outline`, which can have many parts.
          const valueParts = value.split(' ')

          // Validate each part in `value`. Usually just one part.
          valueParts.forEach((valuePart) => {
            if (valuePart === 'none' || valuePart === '0') {
              report({
                ruleName,
                result: postcssResult,
                message: messages.error,
                node: decl,
                word: prop,
              })
            }
          })
        }
      )
    }
  }
)
