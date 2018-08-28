import style, {cacheKey} from './style';
import pile from './pile';

const noopPile = { styles: {}, props: {}, extensions: {} };
function noopTransformer(prop) { return prop }

function factory(parentPile, sheet = {}, stylesTransformer, propsTransformer) {
  if (stylesTransformer == null) {
    stylesTransformer = noopTransformer;
  }
  if (propsTransformer == null) {
    propsTransformer = noopTransformer;
  }

  const thisPile = pile(sheet);
  thisPile.styles = stylesTransformer(thisPile.styles);
  thisPile.props = propsTransformer(thisPile.props);

  const combinedPiles = mergePiles(parentPile, thisPile);
  const styler = withCache(style(combinedPiles));
  styler.extend = (sheet) => factory(combinedPiles, sheet, stylesTransformer, propsTransformer);

  return styler;
};

function mergePiles(parent, child) {
  function warnKeys(a, b, type) {
    Object.keys(b[type]).forEach(key => {
      if (key in a[type]) {
        console.warn(`Overriding key ${key} in ${type}`);
      }
    });
  }

  warnKeys(parent, child, 'styles');
  warnKeys(parent, child, 'props');
  warnKeys(parent, child, 'extensions');

  return {
    styles: { ...parent.styles, ...child.styles },
    props: { ...parent.props, ...child.props },
    extensions: { ...parent.extensions, ...child.extensions },
  };
}

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

function withCache(styler) {
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

    let result = styler(query, toggle);

    if (inline.length) {
      result = mergeInline(result, inline);
    }

    if (key) {
      cache[key] = result;
    }

    return result;
  }
}

export default factory.bind(null, noopPile);
