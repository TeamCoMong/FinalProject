package com.app;

import android.content.Context;
import android.widget.LinearLayout;
import android.widget.TextView;

public class ReverseLabelView extends LinearLayout {

    private TextView str1TextView;
    private TextView str2TextView;

    public ReverseLabelView(Context context) {
        super(context);
        inflate(context, R.layout.view_marker2, this);

        str1TextView = findViewById(R.id.marker2_text1);
        str2TextView = findViewById(R.id.marker2_text2);
    }


    public void setText(String str1, String str2) {
        this.str1TextView.setText(str1);
        this.str2TextView.setText(str2);
    }


}
