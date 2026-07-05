import { CLOUDINARY_CLOUD_NAME } from "@/constants";
import { Cloudinary } from "@cloudinary/url-gen";
import { dpr, format, quality } from "@cloudinary/url-gen/actions/delivery";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { compass, autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { Position } from "@cloudinary/url-gen/qualifiers/position";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";


const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });
export const bannerPhoto = (imageCldPubId: string, name: string) => {
    // Calculate dynamic font size based on text length to avoid overflow on the 1200px wide canvas
    const estimatedCharWidth = 0.55;
    const paddingMultiplier = 5;
    const computedFontSize = Math.floor(1200 / (name.length * estimatedCharWidth + paddingMultiplier));
    const fontSize = Math.max(28, Math.min(55, computedFontSize));

    return cld
        .image(imageCldPubId)
        .resize(fill().width(1200).height(240).gravity(autoGravity()))
        .delivery(format('auto'))
        .delivery(quality('auto'))
        .delivery(dpr('auto')) //device pixel ratio
        .overlay(
            source(
                text(name, new TextStyle('roboto', fontSize).fontWeight('bold'))
                    .textColor(
                        'white'
                    )
            ).position(
                new Position()
                    .gravity(compass('west'))
                    // .offsetY(0.2)
                    .offsetX(0.04)
            )
        );

}