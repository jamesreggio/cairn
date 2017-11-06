import style, {cacheKey} from './style';
import pile from './pile';

function noopStyler() { return { style: [] }; }
function noopTransformer(prop) { return prop }

function factory(parentStyler, sheet = {}, stylesTransformer, propsTransformer) {
  // Check for null or undefined and set to a noop
  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  const stylesAndProps = pile(sheet);

  // Allow the user a chance to transform the styles (e.g. into a RN stylesheet)
  stylesAndProps.styles = stylesTransformer(stylesAndProps.styles);

  // Allow the user a chance to convert the props
  stylesAndProps.props = propsTransformer(stylesAndProps.props);

  // Generate the styling function for the current sheet
  const currentStyler = style(stylesAndProps);

  // Create a new styling function that will combine together the current sheet with the parent
  const combinedStyler = mergedStyle(parentStyler, currentStyler);

  // Add the extend function for chaining
  combinedStyler.extend = (sheet) => factory(combinedStyler, sheet, stylesTransformer, propsTransformer);

  return combinedStyler;
};

function mergeInline(result, inline) {
  if (Array.isArray(inline)) {
    return inline.reduce((result, item) => mergeInline(result, item), result);
  }

  if (inline != null && typeof inline === 'object') {
    const {style, props, ...rest} = inline;

    if (style && props) {
      console.error('Ambiguous inline styles', inline);
    }

    //XXX this doesn't make any sense to me
    if (style) {
      return {
        ...result,
        ...rest,
        style: [...result.style, style],
      };
    }

    if (props) {
      return {
        ...result,
        ...props,
        style: [...result.style, rest],
      };
    }
  }

  return {
    ...result,
    style: [...result.style, inline],
  };
}

function mergedStyle(...stylers) {
  const cache = {};
  return function (query, toggle, inline = []) {
    if (Array.isArray(toggle)) {
      inline = toggle;
      toggle = null;
    }

    const key = cacheKey(query, toggle, inline);
    if (cache[key]) {
      return cache[key];
    }

    let result = stylers.reduce((prevStylesAndProps, styler) => {
      const currentStylesAndProps = styler(query, toggle);
      return {
        ...prevStylesAndProps,
        ...currentStylesAndProps,
        style: [ ...prevStylesAndProps.style, ...currentStylesAndProps.style ]
      };
    }, { style: [] });

    if (inline.length) {
      result = mergeInline(result, inline);
    }

    if (key) {
      cache[key] = result;
    }

    return result;
  }
}

export default factory.bind(null, noopStyler);
